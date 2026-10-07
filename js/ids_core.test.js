// 移植先でも同じテストを通してください:  node ids_core.test.js
const assert = require('assert');
const C = require('./ids_core.js');
const L = require('./ids_layout.js');
const R = require('./ids_radicals.js');

let n = 0;
const t = (name, fn) => { fn(); n++; console.log('ok  ' + name); };

const SAMPLE = [
  'U+660E\t明\t⿰日月', 'U+6797\t林\t⿰木木', 'U+68EE\t森\t⿱木林[GTV]',
  'U+5EAE\t庮\t⿸广酉', 'U+4F11\t休\t⿰亻木', 'U+4E2D\t中\t中',
  'U+2F4A\t\u2F4A\t木'   // 康熙部首の自己参照は捨てられる
].join('\n');
const d = C.createDict(SAMPLE);

t('完全一致', () => assert.deepStrictEqual(d.lookup('⿸广酉').exact, ['庮']));
t('地域タグつきIDSも引ける', () => assert.deepStrictEqual(d.lookup('⿱木林').exact, ['森']));
t('部品を分解すると一致', () => {
  const r = d.lookup('⿱木⿰木木');
  assert.deepStrictEqual(r.exact, []);
  assert.deepStrictEqual(r.expanded, ['森']);
});
t('康熙部首の入力も通常の漢字として扱う', () => assert.deepStrictEqual(d.lookup('⿰\u2F47\u2F49').exact, ['明']));
t('自己参照の行は無視される', () => assert.deepStrictEqual(d.lookup('木').exact, []));
t('部品を含む字', () => assert.deepStrictEqual(d.containing(['木'], 10), ['休', '林', '森']));
t('不正なIDSはエラーになる', () => {
  ['⿰日', '⿰日月木', '', '⿲日月'].forEach(b => assert.throws(() => d.lookup(b)));
});
t('外字表記を1トークンにする', () => assert.deepStrictEqual(C.tokenize('⿰&CDP-8BC5;木'), ['⿰', '&CDP-8BC5;', '木']));
t('拡張漢字(サロゲートペア)を1字として扱う', () => assert.deepStrictEqual(C.tokenize('⿰𠀀木'), ['⿰', '𠀀', '木']));

t('部首データ: 康熙部首は214字・重複なし', () => {
  const all = R.RADICALS.flatMap(g => Array.from(g.kangxi));
  assert.strictEqual(all.length, 214);
  assert.strictEqual(new Set(all).size, 214);
});
t('部首データ: 1〜12画と13画以上の13グループ', () => {
  assert.deepStrictEqual(R.RADICALS.map(g => g.strokes), Array.from({ length: 13 }, (_, i) => i + 1));
  assert.strictEqual(R.RADICALS[12].label, '13画以上');
});
t('部首データ: 全グループを通して重複がない・1字ずつ数えられる', () => {
  const all = R.RADICALS.flatMap(g => Array.from(g.kangxi + g.variants + g.parts));
  assert.strictEqual(new Set(all).size, all.length);
  assert.ok(all.length >= 700, String(all.length));
});
t('部首データ: 康熙部首ブロックの字を含まない(通常の漢字コードだけ)', () => {
  R.RADICALS.forEach(g => assert.ok(!Array.from(g.kangxi + g.variants + g.parts).some(c => c >= '\u2F00' && c <= '\u2FD5')));
});
t('部首データ: 追加部品が入っている', () => {
  const all = R.RADICALS.flatMap(g => Array.from(g.parts)).join('');
  ['乀', '𠃍', '𡿨', '𰀪', '𰕎', '䜌'].forEach(c => assert.ok(all.includes(c), c));
});

t('記述文字: 名前と配置が全部そろっている', () => {
  assert.deepStrictEqual(Object.keys(L.OP_INFO).sort(), Object.keys(C.ARITY).sort());
  for (const [op, k] of Object.entries(C.ARITY)) assert.strictEqual(L.SLOTS[op].length, k, op);
});
t('配置: ⿰は左右2等分', () => {
  const { leaves } = L.layout(C.parse('⿰日月'));
  assert.deepStrictEqual(leaves.map(l => [l.ch, l.x, l.w]), [['日', 0, .5], ['月', .5, .5]]);
});
t('配置: 入れ子(⿱木⿰木木)', () => {
  const { leaves } = L.layout(C.parse('⿱木⿰木木'));
  assert.deepStrictEqual(leaves.map(l => [l.x, l.y, l.w, l.h]), [[0, 0, 1, .5], [0, .5, .5, .5], [.5, .5, .5, .5]]);
});
t('配置: ⿸は外側が全面・内側が右下寄り', () => {
  const { leaves } = L.layout(C.parse('⿸广酉'));
  assert.deepStrictEqual([leaves[0].w, leaves[0].h], [1, 1]);
  assert.ok(leaves[1].x > .2 && leaves[1].y > .2);
});
t('配置: すべての部品が正方形の内側に収まる', () => {
  for (const op of Object.keys(C.ARITY)) {
    const ids = op + 'あ'.repeat(C.ARITY[op]);
    L.layout(C.parse(ids)).leaves.forEach(l => {
      assert.ok(l.x >= 0 && l.y >= 0 && l.x + l.w <= 1.0000001 && l.y + l.h <= 1.0000001, ids);
    });
  }
});
t('配置: 反転・回転・減算の印がつく', () => {
  assert.strictEqual(L.layout(C.parse('⿾日')).leaves[0].mods[0].type, 'flip');
  assert.strictEqual(L.layout(C.parse('⿿日')).leaves[0].mods[0].type, 'rotate');
  const g = L.layout(C.parse('㇯日月')).leaves;
  assert.deepStrictEqual(g.map(l => l.ghost), [false, true]);
});

console.log('\n' + n + ' tests passed');
