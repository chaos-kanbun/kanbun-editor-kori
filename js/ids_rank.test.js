// 部首・部品による検索(rank)のテスト:  node ids_rank.test.js
const assert = require('assert');
const C = require('./ids_core.js');
let n = 0;
const t = (name, fn) => { fn(); n++; console.log('ok  ' + name); };
const d = C.createDict([
  'U+660E\t明\t⿰日月', 'U+6797\t林\t⿰木木', 'U+68EE\t森\t⿱木林[GTV]', 'U+4F11\t休\t⿰亻木',
  'U+6771\t東\t⿻木日', 'U+6813\t栓\t⿰木全', 'U+6718\t朘\t⿰月夋', 'U+2F4A\t\u2F4A\t木'
].join('\n'));
const chars = r => r.map(x => x.ch);

t('部品を1つ:含む字がすべて出て、部品そのものは出ない', () => {
  assert.deepStrictEqual(chars(d.rank(['木'])).sort(), ['休','東','林','栓','森'].sort());
});
t('部品を1つ:形が単純な字が先', () => {
  const r = chars(d.rank(['木']));
  assert.ok(r.indexOf('休') < r.indexOf('森') && r.indexOf('林') < r.indexOf('森'));
});
t('同じ部品を2つ:2つ含む字が上位', () => {
  const r = d.rank(['木', '木']);
  assert.deepStrictEqual(r.slice(0, 2).map(x => x.ch).sort(), ['林', '森'].sort());
  assert.ok(r.slice(0, 2).every(x => x.matched === 2 && x.total === 2));
  assert.ok(r.slice(2).every(x => x.matched === 1));
});
t('部品を2つ:両方含む字が先、片方だけの字が後', () => {
  const r = d.rank(['日', '月']);
  assert.strictEqual(r[0].ch, '明');
  assert.strictEqual(r[0].matched, 2);
  assert.ok(r.slice(1).every(x => x.matched === 1));
  assert.ok(chars(r).includes('東') && chars(r).includes('朘'));
});
t('康熙部首ブロックの字でも入力できる', () => assert.strictEqual(d.rank(['\u2F47', '\u2F49'])[0].ch, '明'));
t('記述文字や空白は無視する', () => assert.strictEqual(d.rank(['⿰', '日', ' ', '月'])[0].ch, '明'));
t('何も含まない部品なら空', () => assert.deepStrictEqual(d.rank(['馬']), []));
t('件数の上限', () => assert.strictEqual(d.rank(['木'], 2).length, 2));
// 複数の辞書ファイルをつなげて使う
const d2 = C.createDict([
  'U+660E\t明\t⿰日月\nU+6797\t林\t⿰木木',            // 1つ目のファイル
  'U+660E\t明\t⿰日月[GT]\nU+23000\t𣀀\t⿰日月\n;; コメント行', // 2つ目のファイル(明が重複)
].join('\n'));
t('複数ファイル:両方の字が使え、重複した字は1つにまとまる', () => {
  assert.strictEqual(d2.size, 3);
  assert.deepStrictEqual(d2.rank(['日', '月']).map(r => r.ch), ['明', '𣀀']);
  assert.deepStrictEqual(d2.lookup('⿰日月').exact, ['明', '𣀀']);
});


// 形が同じ仲間の部品と、細かい部品への分解
const d3 = C.createDict([
  'U+6BBA\t殺\t⿰杀殳[G]\t⿰⿱㐅木殳[J]', 'U+6BB3\t殳\t⿱𠘧又[GT]\t⿱几又[JK]', 'U+6740\t杀\t⿱㐅朩',
  'U+8A9E\t語\t⿰言吾', 'U+8DE1\t跡\t⿰𧾷亦', 'U+6CB3\t河\t⿰氵可', 'U+968A\t隊\t⿰⻖㒸', 'U+90FD\t都\t⿰者⻏',
  'U+X\t段\t⿰𠂤⿱几又'
].join('\n'));
t('仲間の部品:訁で言の字が見つかる', () => assert.strictEqual(d3.rank(['訁', '吾'])[0].ch, '語'));
t('仲間の部品:⻊で𧾷の字、水で氵の字が見つかる', () => {
  assert.strictEqual(d3.rank(['⻊', '亦'])[0].ch, '跡');
  assert.strictEqual(d3.rank(['水', '可'])[0].ch, '河');
});
t('仲間の部品:阝は阜・邑のどちらの字も、阜は阝(左)の字だけ', () => {
  assert.deepStrictEqual(d3.rank(['阝']).map(x => x.ch).sort(), ['都', '隊'].sort());
  assert.deepStrictEqual(d3.rank(['阜']).map(x => x.ch), ['隊']);
});
t('分解:几・又で、殳を含む殺が見つかる(辞書の2つ目の記述の几も使う)', () => {
  const r = d3.rank(['几', '又']);
  const s = r.find(x => x.ch === '殺');
  assert.ok(s && s.matched === 2);
});
t('分解:又・乂(㐅の仲間)で殺が見つかる', () => {
  const s = d3.rank(['又', '乂']).find(x => x.ch === '殺');
  assert.ok(s && s.matched === 2);
});
t('分解:殳で、殳を几・又に分けて書いてある字も見つかる', () => {
  assert.ok(d3.rank(['殳']).some(x => x.ch === '段'));
});
console.log('\n' + n + ' tests passed');
