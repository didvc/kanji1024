// Request handling for the browser-computed API page (api/index.html).
// Pure: takes URLSearchParams, returns a JSON-ready object, or null for "show the guide".
// SPDX-License-Identifier: Apache-2.0
import * as K from "../src/kanji1024.mjs";

const flag = (p, k) => p.has(k) && !/^(0|false|no|off)$/i.test(p.get(k));
const int = (p, k) => {
  if (!p.has(k)) return 0;
  const n = Number(p.get(k));
  if (!Number.isInteger(n) || n < 0) throw fail("bad-parameter", `${k} must be a whole number`);
  return n;
};
const fail = (code, message, position) => Object.assign(new Error(message), { code, position });

const toHex = (b) => Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
const toB64 = (b) => btoa(Array.from(b, (x) => String.fromCharCode(x)).join(""));
function fromHex(s) {
  const c = s.replace(/0x/gi, "").replace(/[\s:,-]/g, "");
  if (!/^(?:[0-9a-f]{2})*$/i.test(c)) throw fail("bad-input", "hex must be pairs of 0-9, a-f");
  return Uint8Array.from(c.match(/../g) || [], (h) => parseInt(h, 16));
}
function fromB64(s) {
  let c = s.replace(/\s/g, "").replace(/-/g, "+").replace(/_/g, "/");
  c += "=".repeat((4 - (c.length % 4)) % 4);
  try { return Uint8Array.from(atob(c), (x) => x.charCodeAt(0)); } catch { throw fail("bad-input", "invalid base64"); }
}

const OPS = {
  encode(p) {
    const given = ["text", "hex", "base64"].filter((k) => p.has(k));
    if (given.length !== 1) throw fail("bad-parameter", "give exactly one of text, hex, base64");
    const v = p.get(given[0]);
    const bytes = given[0] === "text" ? new TextEncoder().encode(v) : given[0] === "hex" ? fromHex(v) : fromB64(v);
    const output = K.encode(bytes, {
      seal: flag(p, "seal"), group: int(p, "group"), wrap: int(p, "wrap"),
      separator: p.get("sep") === "ascii" ? " " : "　",
    });
    return { bytes: bytes.length, output, characters: [...output.replace(/\s/g, "")].length };
  },
  decode(p) {
    if (!p.has("kanji")) throw fail("bad-parameter", "give the text to decode as kanji=");
    const r = K.decode(p.get("kanji"), { strict: !flag(p, "lenient") });
    let text = null;
    try { text = new TextDecoder("utf-8", { fatal: true }).decode(r.bytes); } catch { /* binary */ }
    return {
      bytes: r.bytes.length, text, hex: toHex(r.bytes), base64: toB64(r.bytes),
      sealed: r.sealed, sealOk: r.sealOk,
      warnings: r.warnings.map((w) => ({ code: w.code, message: w.message, position: w.position })),
    };
  },
  describe(p) {
    const chars = [...(p.get("c") || "")].filter((c) => !/\s/u.test(c));
    if (!chars.length) throw fail("bad-parameter", "give characters to describe as c=");
    return { characters: chars.map((c) => K.describe(c) || { char: c, error: "not in the alphabet" }) };
  },
  alphabet: () => ({ alphabet: K.ALPHABET.join(""), end: K.END, seal: K.SEAL, grades: [...K.GRADES] }),
  version: () => ({}),
};

export function handle(params) {
  const op = params.get("op");
  if (op === null) return null;
  const base = { ok: true, op, version: K.VERSION };
  try {
    if (!Object.hasOwn(OPS, op)) throw fail("unknown-op", `unknown op; use one of ${Object.keys(OPS).join(", ")}`);
    return { ...base, ...OPS[op](params) };
  } catch (e) {
    return {
      ...base, ok: false,
      error: { code: e.code || "internal", message: e.message, ...(e.position >= 0 && { position: e.position }) },
    };
  }
}
