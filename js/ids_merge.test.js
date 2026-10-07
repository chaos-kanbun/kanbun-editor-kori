// 辞書をまとめる処理のテスト:  node ids_merge.test.js
const assert = require('assert');
const M = require('./ids_merge.js');
const C = require('./ids_core.js');
let n = 0;
const t = (name, fn) => { fn(); n++; console.log('ok  ' + name); };
const r = M.mergeIdsTexts([
  { name: 'ids-ext-cdef.txt', text: '\uFEFFU+2A700\t𪜀\t⿰日月\nU+660E\t明\t⿱日月\nU+660E\t明\t⿰日月[GT]' },
  { name: 'ここに辞書を入れます.txt', text: 'このフォルダに…' },
  { name: 'ids.txt', text: ';; comment\nU+660E\t明\t⿰日月[GTKV]\nU+6797\t林\t⿰木木\nU+6797\t林\t⿰木木' },
]);
const lines = r.text.split('\n');
t('ids.txt が先、残りは名前順', () => assert.deepStrictEqual(r.files.map(f => f.name), ['ids.txt', 'ids-ext-cdef.txt']));
t('辞書でないファイルは除く', () => assert.deepStrictEqual(r.skipped, ['ここに辞書を入れます.txt']));
t('同じ字は1行にまとまる', () => {
  assert.strictEqual(r.chars, 3);
  assert.strictEqual(lines.filter(l => l.split('\t')[1] === '明').length, 1);
});
t('同じ記述の重複は除き、違う記述は残す(ids.txt の記述が先)', () => {
  assert.deepStrictEqual(lines.find(l => l.split('\t')[1] === '明').split('\t').slice(2), ['⿰日月', '⿱日月']);
  assert.strictEqual(r.duplicates, 2);
});
t('まとめた結果で検索できる', () => {
  const d = C.createDict(r.text);
  assert.deepStrictEqual(d.rank(['日', '月']).map(x => x.ch), ['明', '𪜀']);
  assert.deepStrictEqual(d.lookup('⿱日月').exact, ['明']);
});
t('ids_data.js として読み込める', () => {
  const window = {}; eval(M.toDataJs(r));
  assert.strictEqual(window.IDS_TXT, r.text);
  assert.deepStrictEqual(window.IDS_FILES, ['ids.txt', 'ids-ext-cdef.txt']);
});
t('CHISE の書き方(U-0002B740・@apparent)も読める', () => {
  const r2 = M.mergeIdsTexts([{ name: 'IDS-UCS-Ext-D.txt', text: ';; -*- coding: utf-8-mcs-er -*-\nU-0002B741\t𫝁\t⿱一&CDP-88AD;\t⿻丌口\nU+4E9A\t亚\t亚\t@apparent=⿱一业\nU+4E0E\t与\t⿹②一\t@other=x' }]);
  assert.strictEqual(r2.chars, 3);
  const d = C.createDict(r2.text);
  assert.deepStrictEqual(d.lookup('⿻丌口').exact, ['𫝁']);
  assert.deepStrictEqual(d.lookup('⿱一业').exact, ['亚']);
  assert.ok(!r2.text.includes('@other'));
});
t('互換漢字は統合漢字にまとまり、自己参照の行は除く', () => {
  const r3 = M.mergeIdsTexts([
    { name: 'ids.txt', text: 'U+6D77\t海\t⿰氵每\nU+4E00\t一\t一' },
    { name: 'IDS-UCS-Compat.txt', text: 'U+FA45\t\uFA45\t⿰氵每\nU+F9F4\t\uF9F4\t\uF9F4' },
  ]);
  assert.strictEqual(r3.chars, 1);
  const d = C.createDict(r3.text);
  assert.deepStrictEqual(d.rank(['氵', '每']).map(x => x.ch), ['海']);
  assert.deepStrictEqual(d.rank(['\uFA45']), []); // 互換漢字を部品として入れても統合漢字として扱う(海そのものは出ない)
});
t('整理:地域タグを外し、形の正しくない記述は除き、仲間の部品だけが違う記述は1つにする', () => {
  const r4 = M.mergeIdsTexts([{ name: 'ids.txt', text: [
    'U+968A\t隊\t⿰阝㒸[GTJK]\t⿰⻖㒸', 'U+4EA6\t亦\t&U-i001+2FF1;亣八\t⿱亠⿻⿰丿丨八', 'U-0002B740\t𫝀\t⿱&GT-K00135;一'
  ].join('\n') }]);
  const rows = r4.text.split('\n').map(l => l.split('\t'));
  assert.deepStrictEqual(rows.find(r => r[1] === '隊').slice(2), ['⿰阝㒸']);
  assert.deepStrictEqual(rows.find(r => r[1] === '亦').slice(2), ['⿱亠⿻⿰丿丨八']);
  assert.strictEqual(rows.find(r => r[1] === '𫝀')[0], 'U+2B740');
  assert.strictEqual(r4.invalid, 1);
});
console.log('\n' + n + ' tests passed');
