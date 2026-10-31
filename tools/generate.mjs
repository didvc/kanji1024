// Regenerates data/alphabet.tsv and test/vectors.json from the reference.
// SPDX-License-Identifier: Apache-2.0
import { writeFileSync } from "node:fs";
import { ALPHABET, GRADES, END, SEAL, encode, describe } from "../src/kanji1024.mjs";

const root = new URL("..", import.meta.url);

const rows = ["value\tchar\tcode_point\tgrade\trole"];
ALPHABET.forEach((c, i) => rows.push([i, c, describe(c).codePoint, describe(c).grade, "data"].join("\t")));
for (const c of [END, SEAL]) {
  const d = describe(c);
  rows.push(["-", c, d.codePoint, d.grade, d.role].join("\t"));
}
writeFileSync(new URL("data/alphabet.tsv", root), rows.join("\n") + "\n");

const hex = (b) => Buffer.from(b).toString("hex");
const cases = [
  "", "f", "fo", "foo", "foob", "fooba", "foobar",
  "Hello, world!", "漢字", "あいうえお",
].map((s) => new TextEncoder().encode(s));
cases.push(
  new Uint8Array(5), new Uint8Array(4), Uint8Array.of(0xff, 0xff, 0xff, 0xff, 0xff),
  Uint8Array.from({ length: 256 }, (_, i) => i),
);
const vectors = cases.map((b) => ({
  hex: hex(b),
  plain: encode(b),
  sealed: encode(b, { seal: true }),
}));
writeFileSync(
  new URL("test/vectors.json", root),
  JSON.stringify({ alphabet: ALPHABET.join(""), end: END, seal: SEAL, grades: GRADES, vectors }, null, 1) + "\n",
);
console.log(`data/alphabet.tsv: ${rows.length - 1} rows; test/vectors.json: ${vectors.length} vectors`);
