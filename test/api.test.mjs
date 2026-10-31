// SPDX-License-Identifier: Apache-2.0
import { test } from "node:test";
import assert from "node:assert/strict";
import { handle } from "../api/api.mjs";

const q = (s) => handle(new URLSearchParams(s));

test("no op shows the guide", () => assert.equal(q(""), null));

test("encode and decode round trip through the API", () => {
  const e = q("op=encode&text=Hello%2C%20world!&seal=1");
  assert.equal(e.ok, true);
  assert.equal(e.bytes, 13);
  const d = q("op=decode&kanji=" + encodeURIComponent(e.output));
  assert.equal(d.text, "Hello, world!");
  assert.equal(d.sealOk, true);
  assert.equal(q("op=encode&hex=48656c6c6f").output, q("op=encode&base64=SGVsbG8").output);
});

test("errors are JSON with a code", () => {
  assert.equal(q("op=nope").error.code, "unknown-op");
  assert.equal(q("op=encode").error.code, "bad-parameter");
  assert.equal(q("op=encode&hex=abc").error.code, "bad-input");
  assert.deepEqual(q("op=decode&kanji=一x").error, { code: "foreign", message: "“x” is not a kanji1024 character", position: 1 });
  assert.equal(q("op=decode&kanji=一x&lenient=1").warnings[0].code, "foreign");
});

test("binary decodes to null text", () => {
  const e = q("op=encode&hex=ff");
  assert.equal(q("op=decode&kanji=" + encodeURIComponent(e.output)).text, null);
});

test("describe and alphabet", () => {
  assert.equal(q("op=describe&c=末x").characters[0].lookalikes, "未");
  assert.equal(q("op=describe&c=末x").characters[1].error, "not in the alphabet");
  assert.equal([...q("op=alphabet").alphabet].length, 1024);
});
