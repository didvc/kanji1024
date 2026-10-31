// SPDX-License-Identifier: Apache-2.0
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import * as k from "../src/kanji1024.mjs";

const fixture = JSON.parse(readFileSync(new URL("vectors.json", import.meta.url), "utf8"));
const bytes = (hex) => Uint8Array.from(Buffer.from(hex, "hex"));

test("alphabet: 1024 unique data characters in code point order, plus 終 and 印", () => {
  assert.equal(k.ALPHABET.length, 1024);
  assert.equal(new Set(k.ALPHABET).size, 1024);
  for (let i = 1; i < 1024; i++) assert.ok(k.ALPHABET[i - 1].codePointAt(0) < k.ALPHABET[i].codePointAt(0));
  assert.deepEqual(k.GRADES.map((g) => [...g].length), [80, 160, 200, 202, 193, 191]);
  assert.ok(!k.ALPHABET.includes(k.END) && !k.ALPHABET.includes(k.SEAL));
  assert.equal(new Set(k.GRADES.join("")).size, 1026);
});

test("alphabet is frozen against the published fixture", () => {
  assert.equal(k.ALPHABET.join(""), fixture.alphabet);
  assert.deepEqual([...k.GRADES], fixture.grades);
});

test("vectors", () => {
  for (const v of fixture.vectors) {
    assert.equal(k.encode(bytes(v.hex)), v.plain, v.hex);
    assert.equal(k.encode(bytes(v.hex), { seal: true }), v.sealed, v.hex);
    assert.deepEqual(k.decode(v.plain).bytes, bytes(v.hex));
    const r = k.decode(v.sealed);
    assert.deepEqual(r.bytes, bytes(v.hex));
    assert.equal(r.sealOk, true);
  }
});

test("length: 5 bytes per 4 characters, 終 only after a 4-byte tail", () => {
  for (let n = 0; n < 40; n++) {
    const s = k.encode(new Uint8Array(n));
    assert.equal([...s].length, k.encodedLength(n));
    assert.equal(s.endsWith(k.END), n % 5 === 4);
  }
});

test("random round trip with every layout option", () => {
  for (let i = 0; i < 2000; i++) {
    const b = new Uint8Array(randomBytes(i % 97));
    const opts = { seal: i % 2 === 1, group: i % 9, wrap: i % 31, separator: i % 3 ? " " : "　" };
    assert.deepEqual(k.decode(k.encode(b, opts)).bytes, b, JSON.stringify(opts));
  }
});

test("text helpers", () => {
  for (const s of ["", "a", "日本語のテキスト", "emoji \u{1F98A}", "x".repeat(1000)]) {
    assert.equal(k.decodeText(k.encodeText(s)), s);
  }
});

test("strict decoding rejects damage with a position", () => {
  const cases = [
    ["一x", "foreign", 1],
    ["一丁七万終", "padding", 3],
    ["一丁終", "misplaced-end", 2],
    ["一丁七万終一", "after-end", 5],
    ["一印一", "short-seal", 1],
    ["一印一一一", "after-seal", 4],
  ];
  for (const [text, code, pos] of cases) {
    assert.throws(() => k.decode(text), (e) => e instanceof k.DecodeError && e.code === code && e.position === pos, text);
  }
});

test("the seal catches a single substituted character", () => {
  const sealed = k.encodeText("transfer 1000 to account 42", { seal: true });
  const chars = [...sealed];
  for (let i = 0; i < chars.indexOf(k.SEAL); i++) {
    const copy = chars.slice();
    copy[i] = k.ALPHABET[(k.ALPHABET.indexOf(copy[i]) + 1) % 1024];
    assert.throws(() => k.decode(copy.join("")), (e) => ["seal-mismatch", "padding"].includes(e.code));
  }
});

test("lenient decoding skips noise and reports warnings", () => {
  const enc = k.encodeText("hello", { seal: true });
  const noisy = "「" + [...enc].join(" ") + "」\n";
  const r = k.decode(noisy, { strict: false });
  assert.equal(new TextDecoder().decode(r.bytes), "hello");
  assert.equal(r.sealOk, true);
  assert.deepEqual(r.warnings.map((w) => w.code), ["foreign", "foreign"]);
  assert.throws(() => k.decode(noisy));
});

test("lenient decoding folds compatibility ideographs", () => {
  // Find a compatibility ideograph (U+F900 block) whose canonical form is a data character.
  const fold = [...Array(0x200)].map((_, i) => String.fromCodePoint(0xf900 + i)).find((c) => k.ALPHABET.includes(c.normalize("NFKC")));
  const target = fold.normalize("NFKC");
  const r = k.decode(fold + "一一一", { strict: false });
  assert.deepEqual(r.bytes, k.decode(target + "一一一").bytes);
  assert.equal(r.warnings.length, 0);
  assert.throws(() => k.decode(fold + "一一一"), (e) => e.code === "foreign");
});

test("layout", () => {
  const s = k.encode(new Uint8Array(14), { group: 4, separator: " " });
  assert.equal(s, "一一一一 一一一一 一一一一終");
  const w = k.encode(new Uint8Array(30), { group: 4, separator: " ", wrap: 9 });
  assert.ok(w.split("\n").every((l) => [...l].length <= 9));
});

test("describe", () => {
  assert.deepEqual(k.describe("一"), {
    char: "一", codePoint: "U+4E00", grade: 1, role: "data", value: 0, bits: "0000000000", lookalikes: "",
  });
  assert.equal(k.describe("末").lookalikes, "未");
  assert.equal(k.describe(k.SEAL).role, "seal");
  assert.equal(k.describe("x"), null);
});
