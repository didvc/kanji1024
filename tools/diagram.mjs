// Draws images/bit-layout.svg from the reference implementation.
// SPDX-License-Identifier: Apache-2.0
import { writeFileSync } from "node:fs";
import { ALPHABET, describe } from "../src/kanji1024.mjs";

const word = "fooba";
const bytes = [...new TextEncoder().encode(word)];
const bits = bytes.map((b) => b.toString(2).padStart(8, "0")).join("");
const values = [0, 1, 2, 3].map((i) => parseInt(bits.slice(i * 10, i * 10 + 10), 2));

const W = 800, H = 352, X = 80, B = 16; // bit width
const paper = "#f3eee4", ink = "#1f1b16", mute = "#6c635a", line = "#d6cdbd", shu = "#b53a26";
const grade = ["#2f5577", "#3f6e3a", "#806019", "#8a3556", "#22706d", "#5f4386"];
const sc = (x, y, s, fill = mute) =>
  `<text x="${x}" y="${y}" font-size="10" letter-spacing="2" fill="${fill}">${s.toUpperCase()}</text>`;

const out = [];
out.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="serif" role="img" aria-label="Five bytes regrouped into four ten-bit values, each written as one kanji">`);
out.push(`<rect width="${W}" height="${H}" rx="8" fill="${paper}"/>`);

// row labels
[["bytes", 46], ["bits", 112], ["values", 196], ["kanji", 262]].forEach(([s, y]) => out.push(sc(18, y, s)));

// bytes
bytes.forEach((b, i) => {
  const x = X + i * 8 * B;
  out.push(`<rect x="${x + 2}" y="28" width="${8 * B - 4}" height="34" rx="3" fill="none" stroke="${ink}" stroke-opacity=".35"/>`);
  out.push(`<text x="${x + 4 * B}" y="51" text-anchor="middle" font-size="15" fill="${ink}">${b.toString(16).padStart(2, "0")} <tspan fill="${mute}" font-style="italic">‘${word[i]}’</tspan></text>`);
});

// bits
[...bits].forEach((c, i) => {
  const x = X + i * B, g = Math.floor(i / 10);
  out.push(`<rect x="${x}" y="96" width="${B}" height="26" fill="${g % 2 ? "#ebe4d6" : paper}"/>`);
  out.push(`<text x="${x + B / 2}" y="114" text-anchor="middle" font-family="monospace" font-size="12" fill="${ink}">${c}</text>`);
});
for (let i = 0; i <= 40; i += 8) out.push(`<line x1="${X + i * B}" y1="88" x2="${X + i * B}" y2="96" stroke="${ink}" stroke-opacity=".35"/>`);
for (let i = 0; i <= 40; i += 10) out.push(`<line x1="${X + i * B}" y1="122" x2="${X + i * B}" y2="134" stroke="${shu}" stroke-width="1.5"/>`);
out.push(`<rect x="${X}" y="96" width="${40 * B}" height="26" fill="none" stroke="${line}"/>`);

// values and kanji
values.forEach((v, i) => {
  const cx = X + (i * 10 + 5) * B, k = ALPHABET[v], g = describe(k).grade;
  out.push(`<path d="M${cx} 138 L${cx} 176" stroke="${shu}" stroke-width="1" marker-end="url(#a)"/>`);
  out.push(`<text x="${cx}" y="202" text-anchor="middle" font-size="18" fill="${ink}">${v}</text>`);
  out.push(`<path d="M${cx} 212 L${cx} 226" stroke="${line}"/>`);
  out.push(`<text x="${cx}" y="276" text-anchor="middle" font-size="46" fill="${grade[g - 1]}">${k}</text>`);
  out.push(`<text x="${cx}" y="302" text-anchor="middle" font-size="10" letter-spacing="1.5" fill="${mute}">GRADE ${g}</text>`);
});
out.push(`<defs><marker id="a" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L8 4 L0 8" fill="none" stroke="${shu}"/></marker></defs>`);

// caption
out.push(`<text x="${W - 20}" y="${H - 16}" text-anchor="end" font-size="11" font-style="italic" fill="${mute}">5 bytes = 40 bits = 4 × 10 bits → ${values.map((v) => ALPHABET[v]).join("")}</text>`);
out.push(`<rect x="${W - 44}" y="18" width="26" height="26" rx="3" fill="${shu}" transform="rotate(-3 ${W - 31} 31)"/>`);
out.push(`<text x="${W - 31}" y="38" text-anchor="middle" font-size="17" fill="${paper}" transform="rotate(-3 ${W - 31} 31)">漢</text>`);
out.push("</svg>");

writeFileSync(new URL("../images/bit-layout.svg", import.meta.url), out.join("\n") + "\n");
console.log("images/bit-layout.svg:", values.join(" "), values.map((v) => ALPHABET[v]).join(""));
