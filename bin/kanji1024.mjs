#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
import { readFileSync, writeFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { encode, decode, DecodeError, VERSION, describe } from "../src/kanji1024.mjs";

const HELP = `kanji1024 ${VERSION} — write bytes as kyōiku kanji, and read them back

Usage:
  kanji1024 [options] [FILE]          encode FILE (or standard input)
  kanji1024 -d [options] [FILE]       decode FILE (or standard input)
  kanji1024 -i CHARS                  describe characters

Options:
  -d, --decode        decode instead of encode
  -s, --seal          encode: append the 印 checksum
  -g, --group N       encode: separate every N characters (4 = one block of 5 bytes)
  -w, --wrap N        encode: wrap lines at N characters (default 0 = no wrap)
  -l, --lenient       decode: skip foreign characters and report problems as warnings
  -o, --output FILE   write to FILE instead of standard output
  -i, --info CHARS    show value, grade and look-alikes of each character
  -h, --help          show this help
  -V, --version       show the version

Exit status: 0 success, 1 bad input, 2 usage error.`;

let args;
try {
  args = parseArgs({
    allowPositionals: true,
    options: {
      decode: { type: "boolean", short: "d" },
      seal: { type: "boolean", short: "s" },
      group: { type: "string", short: "g" },
      wrap: { type: "string", short: "w" },
      lenient: { type: "boolean", short: "l" },
      output: { type: "string", short: "o" },
      info: { type: "string", short: "i" },
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "V" },
    },
  });
} catch (e) {
  fail(2, `${e.message}\nTry 'kanji1024 --help'.`);
}
const { values: o, positionals } = args;

if (o.help) out(HELP + "\n");
else if (o.version) out(VERSION + "\n");
else if (o.info !== undefined) info(o.info);
else run();

function run() {
  if (positionals.length > 1) fail(2, "at most one input file");
  const file = positionals[0];
  const input = readFileSync(file && file !== "-" ? file : 0);
  if (o.decode) {
    let r;
    try {
      r = decode(input.toString("utf8"), { strict: !o.lenient });
    } catch (e) {
      if (e instanceof DecodeError) fail(1, `kanji1024: ${e.message}${e.position >= 0 ? ` (character ${e.position + 1})` : ""}`);
      throw e;
    }
    for (const w of r.warnings) process.stderr.write(`kanji1024: warning: ${w.message}${w.position >= 0 ? ` (character ${w.position + 1})` : ""}\n`);
    out(r.bytes);
  } else {
    out(encode(input, { seal: o.seal, group: int(o.group, "group"), wrap: int(o.wrap, "wrap") }) + "\n");
  }
}

function info(chars) {
  const lines = [];
  for (const c of chars) {
    if (/\s/u.test(c)) continue;
    const d = describe(c);
    if (!d) { lines.push(`${c}\tnot in the alphabet`); continue; }
    const what = d.role === "data" ? `value ${d.value}\t${d.bits}` : d.role === "end" ? "end mark" : "seal mark";
    lines.push(`${d.char}\t${d.codePoint}\tgrade ${d.grade}\t${what}${d.lookalikes ? `\tcompare ${d.lookalikes}` : ""}`);
  }
  out(lines.join("\n") + "\n");
}

function int(v, name) {
  if (v === undefined) return 0;
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0) fail(2, `--${name} expects a whole number`);
  return n;
}

function out(data) {
  if (o.output) writeFileSync(o.output, data);
  else process.stdout.write(data);
}

function fail(code, msg) {
  process.stderr.write(msg + "\n");
  process.exit(code);
}
