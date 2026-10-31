// kanji1024 workbench. No dependencies; everything stays in the page.
// SPDX-License-Identifier: Apache-2.0
import * as K from "../src/kanji1024.mjs";

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const utf8 = new TextEncoder();
const RENDER_LIMIT = 30000; // characters rendered one by one; above this, plain text
const HASH_LIMIT = 4000;    // longest input kept in the address bar

// ── words ───────────────────────────────────────────────────────────────────
const STR = {
  en: {
    skip: "Skip to the workbench", tagline: "bytes, written in the kanji every child learns",
    theme: "Theme", themeAuto: "Auto", themeLight: "Washi", themeDark: "Sumi",
    tabWork: "Workbench", tabAlphabet: "Alphabet", tabHow: "How it works",
    encode: "Encode", decode: "Decode", swap: "Swap", swapTitle: "Use the output as the new input",
    tryLabel: "Try", presetHello: "a greeting", presetDigest: "a fingerprint", presetDamaged: "a damaged copy",
    input: "Input", output: "Output", clear: "Clear",
    kindText: "Text", kindHex: "Hex", kindBase64: "Base64", kindDigest: "SHA-256 of text", kindFile: "File",
    fileNone: "No file chosen.", fileChoose: "Choose a file", fileHint: "…or drop one here. Nothing leaves this page.",
    copy: "Copy", download: "Download", share: "Link",
    encOpts: "Encoding", decOpts: "Decoding", dispOpts: "Display",
    optSeal: "Add a seal", optSealHint: "Two extra characters that catch copying mistakes.",
    optGroup: "Group every", none: "no grouping", group4: "4 characters (5 bytes)", group8: "8 characters (10 bytes)",
    optWrap: "Line width", noWrap: "no wrapping", optSep: "Group separator", sepIdeo: "full-width space", sepAscii: "half-width space",
    optLenient: "Forgiving", optLenientHint: "Skip stray marks, brackets and look-alike forms, and report problems as warnings instead of stopping.",
    optGrades: "Colour by school grade", optLook: "Mark look-alikes",
    optLookHint: "Underlines characters that are easy to confuse by hand, such as 未 and 末.",
    compare: "Compare with other notations", inspectHint: "Point at or tap a kanji to inspect it.",
    alphaLede: "All 1026 kanji of the 2020 school allocation table. 1024 of them carry ten bits each, numbered in code point order; 終 closes a short final block and 印 introduces the seal.",
    alphaSearch: "Find a kanji or a number", all: "All", marks: "Marks", gradeN: "Grade {n}", gradeShort: "G{n}",
    shown: "{n} shown",
    how1h: "Cut the bytes into blocks of five", how1: "Five bytes are forty bits. Forty bits make four numbers from 0 to 1023.",
    how2h: "Write each number as a kanji", how2: "The 1024 kanji are ordered by code point: 0 is 一, 1 is 丁, … 1023 is 鼻. Every one is taught by the end of primary school.",
    how3h: "Close the end, and seal if you like", how3: "A short last block needs one to four kanji. Only a four-byte remainder is ambiguous, so it ends with 終. An optional 印 and two more kanji form a checksum.",
    whenH: "When it helps", whenNotH: "When it does not",
    whenList: "<li>Reading a fingerprint or key aloud, or copying it by hand: 32 bytes become 26 familiar kanji.</li><li>Passing data through places that accept Japanese text but mangle symbols.</li><li>Short codes that look at home in Japanese print.</li>",
    whenNotList: "<li>Saving bytes: each kanji costs three bytes in UTF-8, so the result is larger than base64.</li><li>Keeping secrets: this is a notation, not encryption. Anyone can read it back.</li><li>Web addresses: kanji in a URL are escaped to nine ASCII characters each.</li>",
    specLink: "Read the full specification",
    footer: "kanji1024 is a notation, not encryption. It runs only in your browser and sends nothing anywhere. Not affiliated with any government body; the character list is the public school allocation table.",
    licence: "Code under Apache-2.0, specification and data under CC BY 4.0.",
    phText: "Type or paste anything…", phHex: "48 65 6c 6c 6f — spaces, colons and 0x are ignored",
    phBase64: "SGVsbG8= — standard or URL-safe", phDigest: "Text to fingerprint; its 32-byte SHA-256 is encoded",
    phDecode: "Paste kanji1024 text. Spaces and line breaks are ignored.",
    hintDigest: "Fingerprints are compared by eye or read aloud; 26 kanji instead of 64 hex digits.",
    emptyEncode: "The kanji appear here.", emptyDecode: "The decoded bytes appear here.",
    sInBytes: "bytes in", sKanji: "kanji", sUtf8: "UTF-8 bytes", sUtf16: "UTF-16 units", sB64: "base64 chars",
    sRound: "round trip", sOut: "bytes out", sSeal: "seal", sealOk: "matches", sealBad: "broken", sealNone: "none",
    sWarn: "warnings", yes: "verified", no: "failed",
    rowK: "kanji1024", rowB64: "base64", rowHex: "hex", colChars: "chars", colBytes: "UTF-8 bytes",
    iValue: "Value", iBits: "Bits", iCode: "Code point", iGrade: "Taught in", iRole: "Role", iLook: "Compare",
    roleData: "data", roleEnd: "end mark — closes a 4-byte final block", roleSeal: "seal mark — two checksum kanji follow",
    gradeYear: "grade {n}",
    copied: "Copied.", copyFail: "Could not copy; select the text instead.", linkCopied: "Link copied.",
    linkLong: "Link copied without the input (too long for an address).",
    notText: "These bytes are not valid UTF-8 text, so they are shown as hex.",
    sealVerified: "Seal 印 matches: the text was copied correctly.",
    badHex: "Hex digits come in pairs of 0–9 and a–f.", badB64: "That is not valid base64.",
    tooLarge: "Large output: shown as plain text without per-character inspection.",
    err_foreign: "“{c}” is not a kanji1024 character.",
    err_padding: "The last kanji carries leftover bits; the text was probably cut short or mistyped.",
    "err_misplaced-end": "終 may only close a block of four kanji.",
    "err_after-end": "“{c}” comes after the end mark 終.",
    "err_short-seal": "The seal 印 must be followed by exactly two kanji.",
    "err_after-seal": "“{c}” comes after the seal.",
    "err_seal-mismatch": "The seal does not match: something was changed or mistyped.",
    errAt: "at character {n}", lenientTip: "Turn on “Forgiving” to read past this.",
    kindLabel: "Input kind", viewLabel: "Show decoded bytes as", outKeys: "Use the arrow keys to inspect each kanji.",
    inspector: "Inspector", filterLabel: "Filter by grade", sections: "Sections", direction: "Direction",
    colNotation: "Notation", colText: "Text",
  },
  ja: {
    skip: "ワークベンチへ移動", tagline: "小学校で習う漢字で、データを書く",
    theme: "表示", themeAuto: "自動", themeLight: "和紙", themeDark: "墨",
    tabWork: "変換", tabAlphabet: "字表", tabHow: "仕組み",
    encode: "符号化", decode: "復号", swap: "入れ替え", swapTitle: "出力を次の入力にする",
    tryLabel: "例", presetHello: "あいさつ", presetDigest: "指紋（ハッシュ）", presetDamaged: "写し間違い",
    input: "入力", output: "出力", clear: "消去",
    kindText: "テキスト", kindHex: "16進", kindBase64: "Base64", kindDigest: "テキストのSHA-256", kindFile: "ファイル",
    fileNone: "ファイル未選択", fileChoose: "ファイルを選ぶ", fileHint: "またはここへドロップ。外部へは送信されません。",
    copy: "コピー", download: "保存", share: "リンク",
    encOpts: "符号化", decOpts: "復号", dispOpts: "表示",
    optSeal: "印を付ける", optSealHint: "末尾に2字を足し、写し間違いを検出します。",
    optGroup: "区切り", none: "区切らない", group4: "4字ごと（5バイト）", group8: "8字ごと（10バイト）",
    optWrap: "行の幅", noWrap: "折り返さない", optSep: "区切り文字", sepIdeo: "全角スペース", sepAscii: "半角スペース",
    optLenient: "寛容に読む", optLenientHint: "余計な記号・括弧・異体の字形を読み飛ばし、問題は止めずに警告として示します。",
    optGrades: "学年で色分け", optLook: "似た字に印",
    optLookHint: "未と末のように、手書きで取り違えやすい字に下線を引きます。",
    compare: "他の表記と比べる", inspectHint: "漢字を指すかタップすると詳細を表示します。",
    alphaLede: "2020年度施行の学年別漢字配当表の全1026字。うち1024字がそれぞれ10ビットを表し、文字コード順に番号が付きます。終は短い最終ブロックを閉じ、印はチェックサムの始まりを示します。",
    alphaSearch: "漢字または番号で検索", all: "全部", marks: "記号字", gradeN: "{n}年", gradeShort: "{n}年",
    shown: "{n}字を表示",
    how1h: "バイト列を5バイトずつに切る", how1: "5バイトは40ビット。40ビットは0〜1023の数4つになります。",
    how2h: "それぞれの数を漢字で書く", how2: "1024字は文字コード順に並びます。0は一、1は丁、…1023は鼻。どれも小学校で習う字です。",
    how3h: "末尾を閉じ、必要なら印を押す", how3: "最後の半端なブロックは1〜4字。4バイトの余りだけは区別できないので、終で閉じます。任意の印と2字がチェックサムです。",
    whenH: "向いている用途", whenNotH: "向いていない用途",
    whenList: "<li>指紋（ハッシュ）や鍵を読み上げたり書き写したりする：32バイトが見慣れた漢字26字になります。</li><li>日本語は通るが記号が化ける経路にデータを通す。</li><li>日本語の紙面に馴染む短いコード。</li>",
    whenNotList: "<li>容量の節約：UTF-8では1字3バイトなので、Base64より大きくなります。</li><li>秘密の保護：これは表記法であり暗号ではありません。誰でも元に戻せます。</li><li>URL：URL中の漢字は1字あたりASCII 9文字にエスケープされます。</li>",
    specLink: "仕様書を読む",
    footer: "kanji1024は表記法であり、暗号ではありません。ブラウザ内だけで動作し、どこにも送信しません。いかなる行政機関とも無関係です。字の一覧は公開されている学年別漢字配当表によります。",
    licence: "コードはApache-2.0、仕様書とデータはCC BY 4.0。",
    phText: "文字を入力または貼り付け…", phHex: "48 65 6c 6c 6f — 空白・コロン・0xは無視", phBase64: "SGVsbG8= — 標準形・URL安全形",
    phDigest: "指紋を取るテキスト。その32バイトのSHA-256を符号化します",
    phDecode: "kanji1024の文字列を貼り付け。空白と改行は無視されます。",
    hintDigest: "指紋は目で照合したり読み上げたりするもの。16進64桁の代わりに漢字26字。",
    emptyEncode: "ここに漢字が出ます。", emptyDecode: "ここに復号したバイト列が出ます。",
    sInBytes: "入力バイト", sKanji: "漢字", sUtf8: "UTF-8バイト", sUtf16: "UTF-16単位", sB64: "Base64字数",
    sRound: "往復確認", sOut: "出力バイト", sSeal: "印", sealOk: "一致", sealBad: "不一致", sealNone: "なし",
    sWarn: "警告", yes: "成功", no: "失敗",
    rowK: "kanji1024", rowB64: "Base64", rowHex: "16進", colChars: "字数", colBytes: "UTF-8バイト",
    iValue: "値", iBits: "ビット", iCode: "符号位置", iGrade: "配当", iRole: "役割", iLook: "似た字",
    roleData: "データ", roleEnd: "終端字 — 4バイトの最終ブロックを閉じる", roleSeal: "印字 — 後にチェックサム2字が続く",
    gradeYear: "{n}年",
    copied: "コピーしました。", copyFail: "コピーできません。文字を選択してください。", linkCopied: "リンクをコピーしました。",
    linkLong: "入力が長すぎるため、入力を含まないリンクをコピーしました。",
    notText: "UTF-8のテキストではないため、16進で表示しています。",
    sealVerified: "印が一致：正しく写されています。",
    badHex: "16進は0〜9とa〜fの2桁ずつで書きます。", badB64: "Base64として正しくありません。",
    tooLarge: "出力が大きいため、1字ずつの詳細表示なしで表示しています。",
    err_foreign: "「{c}」はkanji1024の字ではありません。",
    err_padding: "最後の字に余分なビットがあります。途中で切れたか、写し間違いの可能性があります。",
    "err_misplaced-end": "終は4字のブロックの直後にしか置けません。",
    "err_after-end": "終の後に「{c}」があります。",
    "err_short-seal": "印の後にはちょうど2字が必要です。",
    "err_after-seal": "印の後に「{c}」があります。",
    "err_seal-mismatch": "印が一致しません。どこかが変わったか、写し間違いがあります。",
    errAt: "{n}字目", lenientTip: "「寛容に読む」をオンにすると先へ進めます。",
    kindLabel: "入力の種類", viewLabel: "復号結果の表示形式", outKeys: "矢印キーで1字ずつ詳細を表示します。",
    inspector: "詳細", filterLabel: "学年で絞り込み", sections: "セクション", direction: "変換の向き",
    colNotation: "表記", colText: "文字列",
  },
};

// ── state ───────────────────────────────────────────────────────────────────
const DEFAULTS = {
  tab: "work", mode: "encode", kind: "text", in: "", seal: false, group: 0, wrap: 0, sep: "ideo",
  lenient: false, view: "text", grades: true, look: false, filter: "all", q: "", lang: "", theme: "", pick: "",
};
const S = { ...DEFAULTS };
let fileBytes = null, fileName = "";
let lastOut = { text: "", bytes: null, filename: "kanji1024.txt" };

const store = {
  get(k) { try { return localStorage.getItem("kanji1024." + k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem("kanji1024." + k, v); } catch { /* private mode */ } },
};

function readHash() {
  const p = new URLSearchParams(location.hash.slice(1));
  for (const k of Object.keys(DEFAULTS)) {
    if (!p.has(k)) continue;
    const v = p.get(k), d = DEFAULTS[k];
    S[k] = typeof d === "boolean" ? v === "1" : typeof d === "number" ? Number(v) || 0 : v;
  }
}
function writeHash(includeInput = true) {
  const p = new URLSearchParams();
  for (const [k, d] of Object.entries(DEFAULTS)) {
    let v = S[k];
    if (k === "in" && (!includeInput || S.kind === "file" || v.length > HASH_LIMIT)) continue;
    if (k === "lang" || k === "theme") continue;
    if (v === d) continue;
    p.set(k, typeof v === "boolean" ? (v ? "1" : "0") : String(v));
  }
  const h = p.toString();
  history.replaceState(null, "", h ? "#" + h : location.pathname + location.search);
}

const lang = () => (S.lang === "ja" || S.lang === "en" ? S.lang : "en");
function t(key, vars = {}) {
  const s = STR[lang()][key] ?? STR.en[key] ?? key;
  return s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
}

// ── helpers ─────────────────────────────────────────────────────────────────
const toHex = (b) => Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
function toB64(b) {
  let s = "";
  for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000));
  return btoa(s);
}
function fromHex(s) {
  const clean = s.replace(/0x/gi, "").replace(/[\s:,\-]/g, "");
  if (!/^[0-9a-f]*$/i.test(clean) || clean.length % 2) throw new Error(t("badHex"));
  return Uint8Array.from(clean.match(/../g) || [], (h) => parseInt(h, 16));
}
function fromB64(s) {
  let clean = s.replace(/\s/g, "").replace(/-/g, "+").replace(/_/g, "/");
  clean += "=".repeat((4 - (clean.length % 4)) % 4);
  try { return Uint8Array.from(atob(clean), (c) => c.charCodeAt(0)); } catch { throw new Error(t("badB64")); }
}
function equalBytes(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}
const el = (tag, props = {}, ...kids) => {
  const e = Object.assign(document.createElement(tag), props);
  for (const k of kids) e.append(k);
  return e;
};
function toast(msg) {
  const n = $("#toast");
  n.textContent = msg;
  n.classList.add("show");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => n.classList.remove("show"), 1800);
}

// ── rendering kanji ─────────────────────────────────────────────────────────
function kanjiNodes(text, badPos = -1) {
  const frag = document.createDocumentFragment();
  const chars = [...text];
  if (chars.length > RENDER_LIMIT) { frag.append(text); return frag; }
  let run = "";
  const flush = () => { if (run) { frag.append(run); run = ""; } };
  chars.forEach((c, i) => {
    const d = K.describe(c);
    if (i === badPos) { flush(); frag.append(el("span", { className: "bad", textContent: c })); return; }
    if (!d) { run += c; return; }
    flush();
    const s = el("span", { className: "k" + (d.role !== "data" ? " m" : ""), textContent: c });
    s.dataset.g = d.grade;
    if (d.lookalikes) s.dataset.la = d.lookalikes;
    frag.append(s);
  });
  flush();
  return frag;
}

function setOutput(node, cls = "") {
  const o = $("#output");
  o.className = "output " + cls + (S.grades ? " g" : "") + (S.look ? " la" : "");
  o.replaceChildren(node);
}
const empty = (key) => el("span", { className: "empty", textContent: t(key) });

function problem(msg, cls = "") {
  $("#problems").append(el("p", { className: cls, textContent: msg }));
}
function errorText(e) {
  const chars = [...$("#input").value];
  let msg = t("err_" + e.code, { c: chars[e.position] ?? "" });
  if (msg === "err_" + e.code) msg = e.message;
  return e.position >= 0 ? `${msg} (${t("errAt", { n: e.position + 1 })})` : msg;
}

function stats(items) {
  $("#stats").replaceChildren(...items.map(([k, v, small]) =>
    el("div", {}, el("dt", { textContent: k }), el("dd", {}, String(v), small ? el("small", { textContent: " " + small }) : ""))));
}

function compareTable(bytes, ktext) {
  if (!bytes) { $("#compare").replaceChildren(); return; }
  const cut = (s) => (s.length > 600 ? s.slice(0, 600) + "…" : s);
  const plain = K.encode(bytes);
  const rows = [
    [t("rowK"), plain, [...plain].length, utf8.encode(plain).length],
    [t("rowB64"), toB64(bytes), toB64(bytes).length, toB64(bytes).length],
    [t("rowHex"), toHex(bytes), bytes.length * 2, bytes.length * 2],
  ];
  $("#compare").replaceChildren(el("table", {},
    el("thead", {}, el("tr", {}, ...[["colNotation", ""], ["colText", ""], ["colChars", "n"], ["colBytes", "n"]]
      .map(([k, cls]) => el("th", { scope: "col", className: cls, textContent: t(k) })))),
    el("tbody", {}, ...rows.map(([name, s, c, b]) => el("tr", {},
      el("th", { scope: "row", textContent: name }), el("td", { textContent: cut(s), lang: name === t("rowK") ? "ja" : "en" }),
      el("td", { className: "n", textContent: c }), el("td", { className: "n", textContent: b }))))));
}

// ── the main loop ───────────────────────────────────────────────────────────
let seq = 0;
async function inputBytes() {
  const v = $("#input").value;
  switch (S.kind) {
    case "hex": return fromHex(v);
    case "base64": return fromB64(v);
    case "digest": return new Uint8Array(await crypto.subtle.digest("SHA-256", utf8.encode(v)));
    case "file": return fileBytes || new Uint8Array(0);
    default: return utf8.encode(v);
  }
}

async function update() {
  const my = ++seq;
  $("#problems").replaceChildren();
  $("#input").removeAttribute("aria-invalid");
  if (S.mode === "encode") {
    let bytes;
    try { bytes = await inputBytes(); } catch (e) {
      if (my !== seq) return;
      $("#input").setAttribute("aria-invalid", "true");
      setOutput(empty("emptyEncode")); problem(e.message); stats([]); compareTable(null);
      lastOut = { text: "", bytes: null }; return;
    }
    if (my !== seq) return;
    const opts = { seal: S.seal, group: S.group, wrap: S.wrap, separator: S.sep === "ascii" ? " " : "　" };
    const text = K.encode(bytes, opts);
    const round = equalBytes(K.decode(text).bytes, bytes);
    const isEmpty = bytes.length === 0 && !S.seal && !$("#input").value && S.kind !== "file";
    if (isEmpty) setOutput(empty("emptyEncode"));
    else {
      setOutput(kanjiNodes(text));
      if ([...text].length > RENDER_LIMIT) problem(t("tooLarge"), "ok");
    }
    const bare = text.replace(/\s/g, "");
    stats([
      [t("sInBytes"), bytes.length], [t("sKanji"), [...bare].length],
      [t("sUtf8"), utf8.encode(bare).length], [t("sUtf16"), bare.length],
      [t("sB64"), Math.ceil(bytes.length / 3) * 4], [t("sRound"), round ? "✓" : "✗", round ? t("yes") : t("no")],
    ]);
    compareTable(bytes);
    lastOut = { text, bytes: null, filename: (fileName && S.kind === "file" ? fileName : "kanji1024") + ".txt" };
  } else {
    const text = $("#input").value;
    let r;
    try { r = K.decode(text, { strict: !S.lenient }); } catch (e) {
      if (!(e instanceof K.DecodeError)) throw e;
      $("#input").setAttribute("aria-invalid", "true");
      setOutput(kanjiNodes(text, e.position));
      problem(errorText(e)); problem(t("lenientTip"), "ok");
      stats([[t("sKanji"), [...text.replace(/\s/g, "")].length], [t("sOut"), "—"]]);
      compareTable(null);
      lastOut = { text: "", bytes: null }; return;
    }
    for (const w of r.warnings) problem(errorText(w));
    if (r.sealOk) problem(t("sealVerified"), "ok");
    let shown, cls = "mono";
    if (!text.trim()) shown = empty("emptyDecode");
    else if (S.view === "text") {
      try { shown = new TextDecoder("utf-8", { fatal: true }).decode(r.bytes); cls = "plain"; } catch {
        shown = toHex(r.bytes).replace(/(..)(?!$)/g, "$1 "); problem(t("notText"));
      }
    } else if (S.view === "hex") shown = toHex(r.bytes).replace(/(..)(?!$)/g, "$1 ");
    else shown = toB64(r.bytes);
    setOutput(shown, cls);
    const output = $("#output");
    output.lang = cls === "plain" ? "" : "en";
    stats([
      [t("sKanji"), [...text.replace(/\s/g, "")].length], [t("sOut"), r.bytes.length],
      [t("sSeal"), r.sealOk === null ? "—" : r.sealOk ? "✓" : "✗", r.sealOk === null ? t("sealNone") : r.sealOk ? t("sealOk") : t("sealBad")],
      [t("sWarn"), r.warnings.length],
    ]);
    compareTable(r.bytes);
    lastOut = { text: typeof shown === "string" ? shown : "", bytes: r.bytes, filename: cls === "plain" ? "decoded.txt" : "decoded.bin" };
  }
  $("#copy").disabled = $("#download").disabled = !(lastOut.text || lastOut.bytes?.length);
}

// ── syncing controls ────────────────────────────────────────────────────────
function applyTexts() {
  document.documentElement.lang = lang();
  for (const n of $$("[data-i18n]")) n.textContent = t(n.dataset.i18n);
  for (const n of $$("[data-i18n-html]")) n.innerHTML = t(n.dataset.i18nHtml);
  for (const n of $$("[data-i18n-placeholder]")) n.placeholder = t(n.dataset.i18nPlaceholder);
  for (const n of $$("[data-i18n-title]")) n.title = t(n.dataset.i18nTitle);
  for (const n of $$("[data-i18n-aria-label]")) n.setAttribute("aria-label", t(n.dataset.i18nAriaLabel));
  for (const b of $$("[data-lang]")) b.setAttribute("aria-pressed", String(b.dataset.lang === lang()));
  $("#grade-legend").replaceChildren(...[1, 2, 3, 4, 5, 6].map((n) =>
    el("span", {}, el("b", { textContent: "■ ", style: `color:var(--g${n})` }), t("gradeShort", { n }))));
  buildFilter();
  filterGrid();
}

function syncControls() {
  for (const b of $$("[data-mode]")) b.setAttribute("aria-pressed", String(b.dataset.mode === S.mode));
  const enc = S.mode === "encode";
  $("#kind").hidden = !enc;
  $("#view").hidden = enc;
  $("#kind").value = S.kind;
  $("#view").value = S.view;
  $("#seal").checked = S.seal;
  $("#group").value = String(S.group);
  $("#wrap").value = String(S.wrap);
  $("#sep").value = S.sep;
  $("#lenient").checked = S.lenient;
  $("#grades").checked = S.grades;
  $("#lookalikes").checked = S.look;
  $("#enc-opts").disabled = !enc;
  $("#dec-opts").disabled = enc;
  const fileMode = enc && S.kind === "file";
  $("#input").hidden = fileMode;
  $("#file-box").hidden = !fileMode;
  $("#file-name").textContent = fileBytes ? `${fileName} — ${fileBytes.length.toLocaleString()} B` : t("fileNone");
  const ta = $("#input");
  ta.className = enc ? (S.kind === "hex" || S.kind === "base64" ? "mono" : "") : "kanji";
  ta.lang = enc ? "" : "ja";
  ta.placeholder = !enc ? t("phDecode")
    : t({ text: "phText", hex: "phHex", base64: "phBase64", digest: "phDigest" }[S.kind] || "phText");
  $("#in-hint").textContent = enc && S.kind === "digest" ? t("hintDigest") : "";
  showTab(S.tab, false);
}

function showTab(id, focus = true) {
  S.tab = id;
  for (const b of $$("[data-tab]")) {
    const on = b.dataset.tab === id;
    b.setAttribute("aria-selected", String(on));
    b.tabIndex = on ? 0 : -1;
    if (on && focus) b.focus();
  }
  for (const p of $$("[role=tabpanel]")) p.hidden = p.id !== id;
  const name = { work: "tabWork", alphabet: "tabAlphabet", how: "tabHow" }[id];
  document.title = id === "work" ? "kanji1024" : `${t(name)} — kanji1024`;
}

function applyTheme() {
  const th = S.theme || "auto";
  if (th === "auto") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = th;
  $("#theme").value = th;
}

const changed = () => { syncControls(); writeHash(); update(); };

// ── inspector ───────────────────────────────────────────────────────────────
function inspect(c) {
  const d = K.describe(c);
  if (!d) return;
  for (const n of $$(".output .k.on")) n.classList.remove("on");
  const role = { data: t("roleData"), end: t("roleEnd"), seal: t("roleSeal") }[d.role];
  const rows = [
    d.value !== null && [t("iValue"), d.value],
    d.bits && [t("iBits"), d.bits, "bits"],
    [t("iCode"), d.codePoint],
    [t("iGrade"), t("gradeYear", { n: d.grade })],
    [t("iRole"), role],
    d.lookalikes && [t("iLook"), d.lookalikes],
  ].filter(Boolean);
  const view = () => [
    el("div", { className: "big", lang: "ja", textContent: d.char, style: d.role === "data" ? `color:var(--g${d.grade})` : "color:var(--shu)" }),
    el("dl", {}, ...rows.flatMap(([k, v, cls]) => [el("dt", { textContent: k }), el("dd", { className: cls || "", textContent: v, lang: k === t("iLook") ? "ja" : "" })])),
  ];
  $("#inspector").replaceChildren(...view());
  $("#alpha-inspector").replaceChildren(...view());
}

// ── alphabet ────────────────────────────────────────────────────────────────
function buildGrid() {
  const cells = [...K.ALPHABET, K.END, K.SEAL].map((c) => {
    const d = K.describe(c);
    const b = el("button", { type: "button", className: "cell" + (d.role !== "data" ? " mark-cell" : "") },
      el("b", { textContent: c }), el("small", { textContent: d.value ?? (d.role === "end" ? "END" : "SEAL") }));
    b.dataset.g = d.grade;
    b.dataset.c = c;
    b.dataset.v = d.value ?? "";
    b.dataset.role = d.role;
    b.setAttribute("aria-label", `${c} ${d.value ?? d.role}`);
    return b;
  });
  $("#grid").replaceChildren(...cells);
}
function buildFilter() {
  const opts = [["all", t("all")], ...[1, 2, 3, 4, 5, 6].map((n) => [String(n), t("gradeN", { n })]), ["marks", t("marks")]];
  $("#grade-filter").replaceChildren(...opts.map(([v, label]) => {
    const b = el("button", { type: "button", textContent: label });
    b.dataset.filter = v;
    b.setAttribute("aria-pressed", String(S.filter === v));
    return b;
  }));
}
function filterGrid() {
  const q = S.q.trim();
  const num = /^\d+$/.test(q) ? Number(q) : null;
  let n = 0;
  for (const c of $$("#grid .cell")) {
    let ok = S.filter === "all" || (S.filter === "marks" ? c.dataset.role !== "data" : c.dataset.g === S.filter);
    if (ok && q) ok = num !== null ? c.dataset.v === String(num) : q.includes(c.dataset.c);
    c.hidden = !ok;
    if (ok) n++;
  }
  $("#alpha-count").textContent = t("shown", { n });
}

// ── presets ─────────────────────────────────────────────────────────────────
const PRESETS = {
  hello: () => ({ mode: "encode", kind: "text", in: "こんにちは、世界。Hello, world!", seal: true, group: 4 }),
  digest: () => ({ mode: "encode", kind: "digest", in: "kanji1024", seal: false, group: 4 }),
  damaged: () => {
    const good = [...K.encodeText("北門で七時に。Meet at the north gate at seven.", { seal: true, group: 4 })];
    const i = good.findIndex((c) => K.describe(c)?.lookalikes);
    const at = i >= 0 ? i : 2;
    good[at] = K.describe(good[at])?.lookalikes?.[0] || K.ALPHABET[(K.ALPHABET.indexOf(good[at]) + 1) % 1024];
    return { mode: "decode", in: good.join(""), lenient: false, view: "text", look: true };
  },
};

// ── events ──────────────────────────────────────────────────────────────────
function wire() {
  $$("[data-mode]").forEach((b) => b.addEventListener("click", () => { S.mode = b.dataset.mode; changed(); }));
  $$("[data-tab]").forEach((b) => b.addEventListener("click", () => { showTab(b.dataset.tab); writeHash(); }));
  $(".tabs").addEventListener("keydown", (e) => {
    const tabs = $$("[data-tab]"), i = tabs.findIndex((b) => b.dataset.tab === S.tab);
    const j = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : null;
    if (j === null) return;
    e.preventDefault();
    showTab(tabs[(j + tabs.length) % tabs.length].dataset.tab);
    writeHash();
  });
  $$("[data-lang]").forEach((b) => b.addEventListener("click", () => {
    S.lang = b.dataset.lang; store.set("lang", S.lang); applyTexts(); syncControls(); update();
  }));
  $("#theme").addEventListener("change", (e) => { S.theme = e.target.value; store.set("theme", S.theme); applyTheme(); });

  let typing;
  $("#input").addEventListener("input", (e) => {
    S.in = e.target.value;
    clearTimeout(typing);
    typing = setTimeout(() => { writeHash(); update(); }, 60);
  });
  const bind = (id, key, conv = (v) => v) => $(id).addEventListener("change", (e) => {
    S[key] = conv(e.target.type === "checkbox" ? e.target.checked : e.target.value); changed();
  });
  bind("#kind", "kind"); bind("#view", "view"); bind("#seal", "seal"); bind("#group", "group", Number);
  bind("#wrap", "wrap", Number); bind("#sep", "sep"); bind("#lenient", "lenient"); bind("#grades", "grades");
  bind("#lookalikes", "look");

  $("#clear").addEventListener("click", () => {
    S.in = ""; $("#input").value = ""; fileBytes = null; fileName = ""; changed(); $("#input").focus();
  });
  $("#swap").addEventListener("click", () => {
    if (S.mode === "encode") {
      S.in = lastOut.text; S.mode = "decode";
    } else {
      const bytes = lastOut.bytes || new Uint8Array(0);
      let s = null;
      try { s = new TextDecoder("utf-8", { fatal: true }).decode(bytes); } catch { /* binary */ }
      S.mode = "encode";
      if (s !== null) { S.kind = "text"; S.in = s; } else { S.kind = "hex"; S.in = toHex(bytes); }
    }
    $("#input").value = S.in;
    changed();
  });
  $$("[data-preset]").forEach((b) => b.addEventListener("click", () => {
    Object.assign(S, PRESETS[b.dataset.preset]());
    $("#input").value = S.in;
    changed();
  }));

  $("#copy").addEventListener("click", async () => {
    const text = lastOut.text || "";
    try { await navigator.clipboard.writeText(text); toast(t("copied")); } catch { toast(t("copyFail")); }
  });
  $("#download").addEventListener("click", () => {
    const blob = lastOut.bytes && S.mode === "decode"
      ? new Blob([lastOut.bytes], { type: "application/octet-stream" })
      : new Blob([lastOut.text + "\n"], { type: "text/plain;charset=utf-8" });
    const a = el("a", { href: URL.createObjectURL(blob), download: lastOut.filename || "kanji1024.txt" });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  $("#share").addEventListener("click", async () => {
    const tooLong = S.kind === "file" || S.in.length > HASH_LIMIT;
    writeHash();
    try { await navigator.clipboard.writeText(location.href); toast(t(tooLong ? "linkLong" : "linkCopied")); } catch { toast(location.href); }
  });

  const takeFile = async (f) => {
    if (!f) return;
    if (S.mode === "decode") { S.in = await f.text(); $("#input").value = S.in; changed(); return; }
    fileBytes = new Uint8Array(await f.arrayBuffer()); fileName = f.name; S.kind = "file"; changed();
  };
  $("#file").addEventListener("change", (e) => takeFile(e.target.files[0]));
  const drop = $("#drop");
  drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.classList.add("over"); });
  drop.addEventListener("dragleave", () => drop.classList.remove("over"));
  drop.addEventListener("drop", (e) => {
    drop.classList.remove("over");
    if (!e.dataTransfer.files.length) return;
    e.preventDefault(); takeFile(e.dataTransfer.files[0]);
  });

  const pick = (e) => {
    const k = e.target.closest(".k, .cell");
    if (!k) return;
    inspect(k.dataset.c || k.textContent);
    if (k.classList.contains("k")) k.classList.add("on");
  };
  $("#output").addEventListener("keydown", (e) => {
    const ks = $$(".output .k");
    if (!ks.length || !["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const i = ks.findIndex((n) => n.classList.contains("on"));
    const j = e.key === "Home" ? 0 : e.key === "End" ? ks.length - 1
      : Math.max(0, Math.min(ks.length - 1, i + (e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1)));
    inspect(ks[j].textContent);
    ks[j].classList.add("on");
    ks[j].scrollIntoView({ block: "nearest" });
  });
  $("#output").addEventListener("mouseover", pick);
  $("#output").addEventListener("click", pick);
  $("#grid").addEventListener("click", (e) => {
    const c = e.target.closest(".cell");
    if (!c) return;
    inspect(c.dataset.c);
  });
  $("#grade-filter").addEventListener("click", (e) => {
    const b = e.target.closest("[data-filter]");
    if (!b) return;
    S.filter = b.dataset.filter; buildFilter(); filterGrid(); writeHash();
  });
  $("#alpha-search").addEventListener("input", (e) => { S.q = e.target.value; filterGrid(); writeHash(); });

  window.addEventListener("hashchange", () => { Object.assign(S, DEFAULTS, { lang: S.lang, theme: S.theme }); readHash(); start(); });
}

function start() {
  $("#input").value = S.in;
  $("#alpha-search").value = S.q;
  applyTheme();
  applyTexts();
  syncControls();
  update().then(() => {
    if (!S.pick) return;
    inspect(S.pick);
    $$(".output .k").find((n) => n.textContent === S.pick)?.classList.add("on");
  }).finally(() => { document.documentElement.dataset.ready = "1"; });
}

// ── boot ────────────────────────────────────────────────────────────────────
S.lang = store.get("lang") || ((navigator.language || "").startsWith("ja") ? "ja" : "en");
S.theme = store.get("theme") || "auto";
readHash();
{
  const preset = new URLSearchParams(location.hash.slice(1)).get("preset");
  if (PRESETS[preset]) Object.assign(S, PRESETS[preset]());
}
$("#version").textContent = "v" + K.VERSION;
buildGrid();
wire();
start();
