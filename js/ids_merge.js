/*
 * ids_merge.js — 複数の辞書ファイル(cjkvi-ids 形式の .txt)を1つにまとめる
 *
 * 画面に依存しない純粋な計算です。ブラウザでは window.IDSMerge、Node.js では require で使えます。
 *   mergeIdsTexts([{ name, text }, …])
 *       ids.txt を最優先、残りをファイル名順に読み、同じ字は1行にまとめる。
 *       同じ字に同じ記述が重なった場合は1つだけ残す(地域タグ [GTV] などの違いは同じ記述とみなす)。
 *       互換漢字は、見た目が同じ統合漢字の行にまとめる(同じ字が検索結果に2つ並ばないように)。
 *       辞書の行(U+XXXX または U-XXXXXXXX<タブ>字<タブ>記述)が1行も無いファイルは除く。
 *       「@apparent=記述」の欄は記述として取り込み、ほかの @ で始まる欄は使わない。
 *       さらに、検索に使えるよう次のように整理する(ids_core.js があるとき):
 *         ・地域タグ([GTV] など)や ^…$ の飾りを外す
 *         ・記述の形が正しくないもの(部品が足りない・余るなど)は除く
 *         ・形が同じ仲間の部品だけが違う記述(⿰阝㒸 と ⿰⻖㒸 など)は、1つにまとめる
 *         ・字番号の書き方を「U+XXXX」にそろえる
 *       返り値:{ text, files, skipped, chars, duplicates, invalid }
 *   toDataJs(result)  エディタが読み込む data/ids_data.js の中身を作る
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    let core = null;
    try { core = require('./ids_core.js'); } catch (e) { core = null; }
    module.exports = factory(core);
  } else root.IDSMerge = factory(root.IDSCore || null);
})(typeof self !== 'undefined' ? self : this, function (Core) {
  'use strict';

  // 「U+4E00」(cjkvi-ids)と「U-0002B740」(CHISE の IDS-UCS)のどちらの書き方の行も受け付ける
  const ROW = /^U[+-][0-9A-Fa-f]+\t/;

  // 「@apparent=⿱一业」(見た目どおりの分け方)は、記述として取り込む。その他の @ で始まる欄は使わない
  function columnIds(raw) {
    const s = raw.trim();
    if (s.indexOf('@apparent=') === 0) return s.slice('@apparent='.length).trim();
    if (s[0] === '@') return '';
    return s;
  }

  // 比べるときは、地域タグなどの飾りを外した形で比べる(ids_core.js と同じ規則)
  function cleanIds(s) {
    return s.trim().replace(/^\^/, '').replace(/\$?\([^)]*\)$/, '').replace(/\[[^\]]*\]$/, '').replace(/\$$/, '').trim();
  }

  // 字番号は「U+XXXX」の書き方にそろえる(CHISE の「U-0002B740」も同じ形にする)
  function codeOf(ch, raw) {
    const cp = ch.codePointAt(0);
    if (Array.from(ch).length === 1) return 'U+' + cp.toString(16).toUpperCase().padStart(4, '0');
    return raw.trim();
  }

  // 重なりを見分けるための記述の形。形が同じ仲間の部品(⻖と阝など)は同じ部品として扱う。
  // 形が正しくない記述は null(ids_core.js が無いときは、飾りを外した記述そのもの)
  function searchKey(ids) {
    if (!Core) return ids;
    let tree;
    try { tree = Core.parse(ids); } catch (e) { return null; }
    const walk = t => t.op ? t.op + t.children.map(walk).join('') : (t.ch.length > 1 && t.ch[0] === '&' ? t.ch : Core.keysOf(t.ch)[0]);
    return walk(tree);
  }

  function order(a, b) {
    if (a.name === 'ids.txt') return -1;
    if (b.name === 'ids.txt') return 1;
    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
  }

  function mergeIdsTexts(inputs) {
    const list = inputs.slice().sort(order);
    const entries = new Map(); // 字 → { code, ids: [記述…], keys: Set }
    const files = [], skipped = [];
    let duplicates = 0, invalid = 0;
    list.forEach(({ name, text }) => {
      const lines = String(text).replace(/^\uFEFF/, '').split(/\r?\n/).filter(l => ROW.test(l));
      if (!lines.length) { skipped.push(name); return; }
      files.push({ name, rows: lines.length });
      lines.forEach(line => {
        const cols = line.split('\t');
        // 互換漢字(例:U+FA45 海)は、見た目が同じ統合漢字(U+6D77 海)にまとめる(NFC 正規化)
        const ch = (cols[1] || '').trim().normalize('NFC');
        if (!ch) return;
        let e = entries.get(ch);
        if (!e) entries.set(ch, e = { code: codeOf(ch, cols[0]), ids: [], keys: new Set() });
        cols.slice(2).forEach(raw => {
          const ids = cleanIds(columnIds(raw).normalize('NFC'));
          if (!ids || ids === ch) return; // 空の記述・それ以上分解できない字(自己参照)は除く
          const key = searchKey(ids);
          if (key === null) { invalid++; return; } // 形の正しくない記述は検索に使えないので除く
          if (key === ch) return;
          if (e.keys.has(key)) { duplicates++; return; }
          e.keys.add(key);
          e.ids.push(ids);
        });
      });
    });
    const out = [];
    entries.forEach((e, ch) => { if (e.ids.length) out.push(e.code + '\t' + ch + '\t' + e.ids.join('\t')); });
    return { text: out.join('\n'), files, skipped, chars: out.length, duplicates, invalid };
  }

  function toDataJs(r) {
    return '/* 漢文エディタ 交利 用の辞書。data フォルダの辞書ファイルをまとめて自動で作成したもの。直接編集しないでください。\n'
      + ' * 元のデータ:CHISE IDS Database、CJKVI IDS(CJKVI Database。CHISE IDS Database に基づく)。GNU GPL v2 の条件で使用しています。\n'
      + ' * 加えた変更:複数のファイルを1つにまとめ、重複・形の正しくない記述・地域タグなどを取り除き、字番号の書き方をそろえました。\n'
      + ' * まとめた元のファイル:\n'
      + r.files.map(f => ' *   ' + f.name.replace(/\*\//g, '') + '(' + f.rows + '行)').join('\n') + '\n */\n'
      + 'window.IDS_FILES = ' + JSON.stringify(r.files.map(f => f.name)) + ';\n'
      + 'window.IDS_TXT = ' + JSON.stringify(r.text) + ';\n';
  }

  return { mergeIdsTexts, toDataJs };
});
