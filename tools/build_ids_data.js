#!/usr/bin/env node
/*
 * build_ids_data.js — data フォルダの .txt をすべてまとめて data/ids_data.js を作る
 *   使い方:  node tools/build_ids_data.js
 *   GitHub に置いた場合は、.github/workflows/build-dictionary.yml から自動で実行されます。
 */
const fs = require('fs');
const path = require('path');
const M = require('../js/ids_merge.js');

const dataDir = path.join(__dirname, '..', 'data');
const inputs = fs.readdirSync(dataDir)
  .filter(f => /\.txt$/i.test(f))
  .map(name => ({ name, text: fs.readFileSync(path.join(dataDir, name), 'utf8') }));
const r = M.mergeIdsTexts(inputs);
if (!r.files.length) {
  console.error('data フォルダに辞書のテキストファイルがありません。');
  process.exit(1);
}
fs.writeFileSync(path.join(dataDir, 'ids_data.js'), M.toDataJs(r));
console.log('data/ids_data.js を作りました');
console.log('  まとめた辞書: ' + r.files.map(f => f.name + '(' + f.rows + '行)').join('、'));
console.log('  字の数: ' + r.chars + '  除いた重複: ' + r.duplicates);
if (r.skipped.length) console.log('  辞書の形式でないため除いたファイル: ' + r.skipped.join('、'));
