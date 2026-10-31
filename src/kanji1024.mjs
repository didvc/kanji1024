// kanji1024 — binary-to-text encoding over the 1026 kyōiku kanji.
// Reference implementation. Normative description: SPEC.md.
// SPDX-License-Identifier: Apache-2.0

export const VERSION = "1.0.0";

// The 2020 grade-by-grade kanji allocation table (学年別漢字配当表),
// grades 1–6, each in the table's own reading order.
export const GRADES = Object.freeze([
  "一右雨円王音下火花貝学気九休玉金空月犬見五口校左三山子四糸字耳七車手十出女小上森人水正生青夕石赤千川先早草足村大男竹中虫町天田土二日入年白八百文木本名目立力林六",
  "引羽雲園遠何科夏家歌画回会海絵外角楽活間丸岩顔汽記帰弓牛魚京強教近兄形計元言原戸古午後語工公広交光考行高黄合谷国黒今才細作算止市矢姉思紙寺自時室社弱首秋週春書少場色食心新親図数西声星晴切雪船線前組走多太体台地池知茶昼長鳥朝直通弟店点電刀冬当東答頭同道読内南肉馬売買麦半番父風分聞米歩母方北毎妹万明鳴毛門夜野友用曜来里理話",
  "悪安暗医委意育員院飲運泳駅央横屋温化荷界開階寒感漢館岸起期客究急級宮球去橋業曲局銀区苦具君係軽血決研県庫湖向幸港号根祭皿仕死使始指歯詩次事持式実写者主守取酒受州拾終習集住重宿所暑助昭消商章勝乗植申身神真深進世整昔全相送想息速族他打対待代第題炭短談着注柱丁帳調追定庭笛鉄転都度投豆島湯登等動童農波配倍箱畑発反坂板皮悲美鼻筆氷表秒病品負部服福物平返勉放味命面問役薬由油有遊予羊洋葉陽様落流旅両緑礼列練路和",
  "愛案以衣位茨印英栄媛塩岡億加果貨課芽賀改械害街各覚潟完官管関観願岐希季旗器機議求泣給挙漁共協鏡競極熊訓軍郡群径景芸欠結建健験固功好香候康佐差菜最埼材崎昨札刷察参産散残氏司試児治滋辞鹿失借種周祝順初松笑唱焼照城縄臣信井成省清静席積折節説浅戦選然争倉巣束側続卒孫帯隊達単置仲沖兆低底的典伝徒努灯働特徳栃奈梨熱念敗梅博阪飯飛必票標不夫付府阜富副兵別辺変便包法望牧末満未民無約勇要養浴利陸良料量輪類令冷例連老労録",
  "圧囲移因永営衛易益液演応往桜可仮価河過快解格確額刊幹慣眼紀基寄規喜技義逆久旧救居許境均禁句型経潔件険検限現減故個護効厚耕航鉱構興講告混査再災妻採際在財罪殺雑酸賛士支史志枝師資飼示似識質舎謝授修述術準序招証象賞条状常情織職制性政勢精製税責績接設絶祖素総造像増則測属率損貸態団断築貯張停提程適統堂銅導得毒独任燃能破犯判版比肥非費備評貧布婦武復複仏粉編弁保墓報豊防貿暴脈務夢迷綿輸余容略留領歴",
  "胃異遺域宇映延沿恩我灰拡革閣割株干巻看簡危机揮貴疑吸供胸郷勤筋系敬警劇激穴券絹権憲源厳己呼誤后孝皇紅降鋼刻穀骨困砂座済裁策冊蚕至私姿視詞誌磁射捨尺若樹収宗就衆従縦縮熟純処署諸除承将傷障蒸針仁垂推寸盛聖誠舌宣専泉洗染銭善奏窓創装層操蔵臓存尊退宅担探誕段暖値宙忠著庁頂腸潮賃痛敵展討党糖届難乳認納脳派拝背肺俳班晩否批秘俵腹奮並陛閉片補暮宝訪亡忘棒枚幕密盟模訳郵優預幼欲翌乱卵覧裏律臨朗論",
]);

/** End mark: closes a final block that carries exactly 4 bytes. */
export const END = "終";
/** Seal mark: introduces the two-character checksum. */
export const SEAL = "印";

/** The 1024 data characters, in ascending code point order (index = value). */
export const ALPHABET = Object.freeze(
  [...GRADES.join("")]
    .filter((c) => c !== END && c !== SEAL)
    .sort((a, b) => a.codePointAt(0) - b.codePointAt(0)),
);

const INDEX = new Map(ALPHABET.map((c, i) => [c, i]));
const GRADE = new Map();
GRADES.forEach((s, g) => { for (const c of s) GRADE.set(c, g + 1); });

if (ALPHABET.length !== 1024 || GRADE.size !== 1026) {
  throw new Error("kanji1024: alphabet table is corrupt");
}

/** Pairs that are easy to confuse when copied by hand. */
export const LOOKALIKES = Object.freeze([
  "未末", "土士", "人入", "刀力", "千干", "大犬太", "王玉主", "牛午", "矢失",
  "天夫", "日目", "木本", "貝見", "右石", "母毎", "官宮", "待持", "名各",
  "己巳", "徒従", "崎埼", "績積", "織職識", "復複", "険検験", "壁璧",
].map((g) => [...g].filter((c) => GRADE.has(c)).join("")).filter((g) => g.length > 1));

const LOOKALIKE = new Map();
for (const g of LOOKALIKES) for (const c of g) LOOKALIKE.set(c, g);

export class DecodeError extends Error {
  /**
   * @param {string} code  machine-readable reason
   * @param {string} message
   * @param {number} position  index (in characters) into the input, or -1
   */
  constructor(code, message, position = -1) {
    super(message);
    this.name = "DecodeError";
    this.code = code;
    this.position = position;
  }
}

// ── checksum ───────────────────────────────────────────────────────────────

let CRC_TABLE;
/** CRC-32 (ISO-HDLC, the common zip/png polynomial). */
export function crc32(bytes) {
  if (!CRC_TABLE) {
    CRC_TABLE = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      CRC_TABLE[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

/** The two seal characters for `bytes`: the top 20 bits of CRC-32. */
export function sealOf(bytes) {
  const v = crc32(bytes) >>> 12;
  return ALPHABET[v >>> 10] + ALPHABET[v & 1023];
}

// ── encode ─────────────────────────────────────────────────────────────────

/**
 * Encode bytes to kanji1024 text.
 * @param {Uint8Array|ArrayBuffer|number[]} input
 * @param {{seal?: boolean, group?: number, wrap?: number, separator?: string}} [options]
 *   seal       append 印 and a 20-bit checksum
 *   group      put `separator` after every `group` characters (0 = none)
 *   wrap       break lines at no more than `wrap` characters (0 = none)
 *   separator  group separator, default the ideographic space U+3000
 */
export function encode(input, options = {}) {
  const bytes = toBytes(input);
  const out = [];
  let acc = 0, bits = 0;
  for (let i = 0; i < bytes.length; i++) {
    acc = (acc << 8) | bytes[i];
    bits += 8;
    if (bits >= 10) {
      bits -= 10;
      out.push(ALPHABET[(acc >>> bits) & 1023]);
      acc &= (1 << bits) - 1;
    }
  }
  if (bits > 0) out.push(ALPHABET[(acc << (10 - bits)) & 1023]);
  if (bytes.length % 5 === 4) out.push(END);
  const tail = options.seal ? [SEAL + sealOf(bytes)] : [];
  return layout(out, tail, options);
}

function layout(chars, tail, { group = 0, wrap = 0, separator = "　" } = {}) {
  let tokens;
  if (group > 0) {
    tokens = [];
    for (let i = 0; i < chars.length; i += group) tokens.push(chars.slice(i, i + group).join(""));
    // keep a lone 終 attached to the block it closes
    if (tokens.length > 1 && tokens.at(-1) === END) tokens[tokens.length - 2] += tokens.pop();
    tokens.push(...tail);
  } else {
    tokens = [chars.join("") + tail.join("")];
  }
  if (!(wrap > 0)) return tokens.join(group > 0 ? separator : "");
  if (!(group > 0)) tokens = [...tokens[0]];
  const lines = [];
  let line = "";
  for (const t of tokens) {
    const sep = line && group > 0 ? separator : "";
    if (line && [...line].length + sep.length + [...t].length > wrap) {
      lines.push(line);
      line = t;
    } else line += sep + t;
  }
  if (line || !lines.length) lines.push(line);
  return lines.join("\n");
}

// ── decode ─────────────────────────────────────────────────────────────────

/**
 * Decode kanji1024 text to bytes.
 * Whitespace (including U+3000) is always ignored.
 * @param {string} text
 * @param {{strict?: boolean}} [options]
 *   strict (default true)  reject foreign characters, non-zero padding and a bad seal.
 *   strict: false          normalise compatibility forms, skip foreign characters,
 *                          and report problems as warnings instead.
 * @returns {{bytes: Uint8Array, sealed: boolean, sealOk: boolean|null, warnings: DecodeError[]}}
 */
export function decode(text, { strict = true } = {}) {
  const warnings = [];
  const problem = (code, msg, pos) => {
    const e = new DecodeError(code, msg, pos);
    if (strict) throw e;
    warnings.push(e);
  };

  const chars = [...String(text)];
  const data = []; // [value, position]
  let end = -1, seal = -1, sealChars = [];
  chars.forEach((raw, pos) => {
    if (/\s/u.test(raw)) return;
    const c = strict ? raw : raw.normalize("NFKC");
    if (seal >= 0) {
      if (INDEX.has(c) && sealChars.length < 2) sealChars.push([INDEX.get(c), pos]);
      else if (!INDEX.has(c) && c !== END && c !== SEAL) problem("foreign", `“${raw}” is not a kanji1024 character`, pos);
      else problem("after-seal", `unexpected “${raw}” after the seal`, pos);
      return;
    }
    if (c === SEAL) { seal = pos; return; }
    if (end >= 0) {
      if (INDEX.has(c) || c === END) problem("after-end", `“${raw}” after the end mark 終`, pos);
      else problem("foreign", `“${raw}” is not a kanji1024 character`, pos);
      return;
    }
    if (c === END) { end = pos; return; }
    if (INDEX.has(c)) data.push([INDEX.get(c), pos]);
    else problem("foreign", `“${raw}” is not a kanji1024 character`, pos);
  });

  if (end >= 0 && (data.length === 0 || data.length % 4 !== 0)) {
    problem("misplaced-end", "the end mark 終 may only close a block of 4 characters", end);
  }
  const closed = end >= 0 && data.length > 0 && data.length % 4 === 0;

  const out = new Uint8Array(Math.floor((data.length * 10) / 8));
  let acc = 0, bits = 0, n = 0;
  for (const [v] of data) {
    acc = (acc << 10) | v;
    bits += 10;
    while (bits >= 8) {
      bits -= 8;
      out[n++] = (acc >>> bits) & 0xff;
    }
    acc &= (1 << bits) - 1;
  }
  let bytes = out.subarray(0, n);
  let padOk = acc === 0;
  if (closed) {
    padOk = padOk && bytes[n - 1] === 0;
    bytes = bytes.subarray(0, n - 1);
  }
  if (!padOk && data.length) {
    problem("padding", "the last character carries non-zero padding bits; the text may be damaged", data.at(-1)[1]);
  }

  let sealOk = null;
  if (seal >= 0) {
    if (sealChars.length !== 2) {
      problem("short-seal", "the seal 印 must be followed by exactly two characters", seal);
    } else {
      const v = (sealChars[0][0] << 10) | sealChars[1][0];
      sealOk = v === crc32(bytes) >>> 12;
      if (!sealOk) problem("seal-mismatch", "the seal does not match the content; the text was altered or mistyped", seal);
    }
  }
  return { bytes: Uint8Array.from(bytes), sealed: seal >= 0, sealOk, warnings };
}

// ── conveniences ───────────────────────────────────────────────────────────

const utf8 = new TextEncoder();
const utf8d = new TextDecoder("utf-8", { fatal: true });

/** Encode a string's UTF-8 bytes. */
export const encodeText = (s, options) => encode(utf8.encode(s), options);
/** Decode to a string; throws if the bytes are not valid UTF-8. */
export const decodeText = (s, options) => utf8d.decode(decode(s, options).bytes);

/** Number of kanji1024 characters (without seal or layout) for `n` bytes. */
export const encodedLength = (n) => Math.ceil((n * 8) / 10) + (n % 5 === 4 ? 1 : 0);

/**
 * Describe one character.
 * @returns {null | {char: string, codePoint: string, grade: number,
 *   role: "data"|"end"|"seal", value: number|null, bits: string|null, lookalikes: string}}
 */
export function describe(char) {
  const c = [...String(char)][0];
  if (!c || !GRADE.has(c)) return null;
  const value = INDEX.has(c) ? INDEX.get(c) : null;
  return {
    char: c,
    codePoint: "U+" + c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0"),
    grade: GRADE.get(c),
    role: c === END ? "end" : c === SEAL ? "seal" : "data",
    value,
    bits: value === null ? null : value.toString(2).padStart(10, "0"),
    lookalikes: (LOOKALIKE.get(c) || "").replace(c, ""),
  };
}

function toBytes(input) {
  if (input instanceof Uint8Array) return input;
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  if (ArrayBuffer.isView(input)) return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  if (Array.isArray(input)) return Uint8Array.from(input);
  throw new TypeError("kanji1024.encode expects bytes (Uint8Array, ArrayBuffer or number[])");
}
