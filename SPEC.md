# kanji1024 — specification

Version 1.0.0 · 2026-10-31 · Aesthetic Vulpes

This document is licensed under [CC BY 4.0](LICENSE-CC-BY-4.0). The key words MUST, MUST NOT, SHOULD and MAY are to be read as in RFC 2119.

## 1. Purpose

kanji1024 writes arbitrary bytes as text made only of the kanji that Japanese primary schools teach, ten bits per character, and reads them back without loss. It is a notation. It provides no confidentiality.

## 2. Character repertoire

The repertoire is the 1026 kanji of the *gakunen-betsu kanji haitō-hyō* (学年別漢字配当表), the grade allocation table annexed to the primary school curriculum guidelines published in 2017 and fully in force from April 2020. The repertoire is frozen at that edition. A later revision of the table does not change kanji1024.

Each character is identified by its ISO/IEC 10646 code point. All 1026 lie in the range U+4E00–U+9F3B.

Two characters are reserved as marks:

| Mark | Code point | Name | Meaning |
|---|---|---|---|
| 終 | U+7D42 | end mark | the final block carries exactly 4 bytes |
| 印 | U+5370 | seal mark | the next two characters are a checksum |

The remaining 1024 characters are the data alphabet. They are sorted by ascending code point and numbered 0 to 1023. Value 0 is 一 (U+4E00), value 1 is 丁 (U+4E01), and value 1023 is 鼻 (U+9F3B). The complete table is [`data/alphabet.tsv`](data/alphabet.tsv). That file is normative.

## 3. Encoding

1. Split the input into blocks of 5 bytes. The last block may be shorter, holding 1 to 4 bytes. It is called the remainder.
2. Read each full block as a 40-bit big-endian integer and cut it into four 10-bit values, most significant first. Write each value as its data character.
3. For a remainder of *r* bytes, append zero bits to its 8*r* bits until the length is a multiple of 10. Then write the resulting ⌈8*r*/10⌉ values in the same way.

   | *r* | characters | zero padding bits |
   |---|---|---|
   | 1 | 1 | 2 |
   | 2 | 2 | 4 |
   | 3 | 3 | 6 |
   | 4 | 4 | 8 |

4. If *r* = 4, append the end mark 終.

Encoding *n* bytes yields ⌈8*n*/10⌉ characters, plus one more when *n* mod 5 = 4. The empty input encodes to the empty string.

## 4. Seal (optional checksum)

An encoder MAY append a seal: the seal mark 印 followed by two data characters *a* and *b*. Their combined value (*a* × 1024 + *b*) is the upper 20 bits of the CRC-32 of the input bytes, that is, CRC-32 shifted right by 12. CRC-32 here is the common reflected polynomial 0xEDB88320, with initial value and final XOR 0xFFFFFFFF.

The seal follows the end mark when both are present. A seal detects any single changed character, and a random alteration with probability 1 − 2⁻²⁰.

## 5. Layout

Encoders MAY insert white space anywhere, for example a space after every 4 characters (one block) or line breaks. U+3000 IDEOGRAPHIC SPACE is the recommended separator in Japanese text. White space carries no meaning.

## 6. Decoding

A decoder MUST ignore all white space. White space means the characters with the White_Space property, which include U+0020, U+3000 and line breaks.

The remaining characters MUST match this grammar:

```
text  = data* [ END ] [ SEAL data data ]
```

A strict decoder MUST reject the input in each of the following cases. The codes are the ones the reference implementation reports.

| Code | Condition |
|---|---|
| `foreign` | a character is neither a data character nor a mark |
| `misplaced-end` | 終 is present but the number of data characters is not a positive multiple of 4 |
| `after-end` | a character other than the seal follows 終 |
| `short-seal`, `after-seal` | the seal is not exactly 印 followed by two data characters |
| `padding` | the padding bits in the last character are not zero |
| `seal-mismatch` | a seal is present and does not match the decoded bytes |

To decode, concatenate the 10-bit values of the data characters. With *m* data characters, the output is ⌊10*m*/8⌋ bytes and the leftover 2, 4 or 6 bits are padding. When 終 is present the output is one byte shorter, because the final 8 bits are padding.

A forgiving decoder MAY additionally apply NFKC normalisation, which maps compatibility ideographs to their unified forms. It MAY skip characters outside the repertoire and report the problems above as warnings instead of failing. A forgiving decoder MUST NOT silently accept a seal mismatch; it MUST report it.

## 7. Conformance and naming

An implementation may call itself *kanji1024* only if it encodes every vector in [`test/vectors.json`](test/vectors.json) to exactly the given strings and decodes them back. Variants with a different repertoire, order or marks MUST NOT use the name.

## 8. Test vectors

| bytes (hex) | encoded | with seal |
|---|---|---|
| (empty) | (empty) | 印一一 |
| `66` | 拝 | 拝印朝岐 |
| `666f` | 拡績 | 拡績印章補 |
| `666f6f` | 拡美間 | 拡美間印波表 |
| `666f6f62` | 拡美電検終 | 拡美電検終印女新 |
| `666f6f6261` | 拡美電燃 | 拡美電燃印田構 |
| `666f6f626172` | 拡美電燃昼 | 拡美電燃昼印町談 |
| `0000000000` | 一一一一 | 一一一一印航泉 |
| `00000000` | 一一一一終 | 一一一一終印動像 |
| `ffffffffff` | 鼻鼻鼻鼻 | 鼻鼻鼻鼻印訓障 |

The full set, including 256 consecutive byte values, is in [`test/vectors.json`](test/vectors.json).

## 9. Rationale (informative)

A power of two was chosen over the full 1026 because it lets the encoder work in fixed 5-byte blocks, so it can stream, run in parallel and concatenate output. Treating all 1026 characters as a base would gain 0.03% in density at the cost of whole-message big-number arithmetic. The two spare characters became the marks instead, and their meanings are legible to anyone who reads kanji: 終 is "end" and 印 is "seal".

Code point order was chosen because anyone can reproduce it from the repertoire alone. Reading order and stroke order vary between sources; code points do not.

The repertoire contains look-alike pairs such as 未/末, 土/士, 人/入, 刀/力 and 千/干. Removing a few would not solve the problem, so the seal is the remedy: use it whenever text will be copied by hand.
