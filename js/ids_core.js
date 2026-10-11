/*
 * ids_core.js — 漢字構成記述(IDS)による漢字検索の計算部分
 *
 * 画面に依存しない純粋な計算です。ブラウザでは window.IDSCore、Node.js では require で使えます。
 *   createDict(text)        ids.txt(cjkvi-ids 形式)の中身から辞書を作る。
 *                           複数の辞書ファイルは、改行でつなげて渡せばまとめて使える(先のファイルの記述が優先)
 *     .lookup(ids)          { exact: 完全一致した字, expanded: 部品を分解すると一致した字 }
 *     .containing(parts, n) 指定した部品をすべて含む字(最大 n 字)
 *     .rank(parts, n)       部首・部品を多く含む字から順に並べる(最大 n 字。漢字検索の画面はこれを使う)
 *   tokenize(ids)           記述を1字ずつに分ける(拡張漢字・&CDP-8BC5; のような外字表記も1つとして扱う)
 *   parse(ids)              記述を木構造にする(形が正しくなければ例外を投げる)
 *   ARITY                   記述文字ごとの部品の数
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.IDSCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const ARITY = {
    '⿰': 2, '⿱': 2, '⿲': 3, '⿳': 3, '⿴': 2, '⿵': 2, '⿶': 2, '⿷': 2, '⿸': 2,
    '⿹': 2, '⿺': 2, '⿻': 2, '⿼': 2, '⿽': 2, '⿾': 1, '⿿': 1, '㇯': 2,
  };

  // 康熙部首ブロック(U+2F00–U+2FD5)の字は、通常の漢字(例: ⽊ → 木)として扱う
  // 互換漢字(例:U+FA45 海)は、見た目が同じ統合漢字(例:U+6D77 海)として扱う
  function normChar(ch) {
    if (!ch) return ch;
    if (ch.length === 1 && ch >= '\u2F00' && ch <= '\u2FD5') return ch.normalize('NFKC');
    return ch.normalize('NFC');
  }

  // 形が同じ仲間の部品(部首の変形・部首補助の字・簡体字の部品など)と、その代表の字。
  // 例:訁・讠・⻈ → 言、氵・氺・⺡ → 水、𧾷・⻊ → 足、𠘧・⺇ → 几、㐅 → 乂
  const VARIANT_OF = {"亻":"人","𠆢":"人","⺅":"人","氵":"水","氺":"水","⺡":"水","⺢":"水","扌":"手","龵":"手","⺘":"手","忄":"心","㣺":"心","⺖":"心","⺗":"心","犭":"犬","⺨":"犬","艹":"艸","⺾":"艸","⺿":"艸","⻀":"艸","辶":"辵","⻌":"辵","⻍":"辵","⻎":"辵","礻":"示","⺬":"示","⺭":"示","衤":"衣","⻂":"衣","訁":"言","讠":"言","⻈":"言","糹":"糸","纟":"糸","⺯":"糸","⺰":"糸","釒":"金","钅":"金","⻐":"金","飠":"食","饣":"食","⻝":"食","⻞":"食","⻟":"食","⻠":"食","𧾷":"足","⻊":"足","罒":"网","罓":"网","⺱":"网","⺲":"网","⺳":"网","⺴":"网","⺵":"网","爫":"爪","⺤":"爪","⺥":"爪","牜":"牛","⺧":"牛","𤣩":"玉","⺩":"玉","灬":"火","⺣":"火","攵":"攴","⺙":"攴","耂":"老","⺹":"老","⺼":"肉","⺮":"竹","𥫗":"竹","刂":"刀","⺈":"刀","⺉":"刀","𠘧":"几","⺇":"几","㐅":"乂","⺌":"小","⺍":"小","尣":"尢","⺎":"尢","⺏":"尢","⺐":"尢","⺑":"尢","⻖":"阜","⻕":"阜","⻏":"邑","⻗":"雨","户":"戶","戸":"戶","歺":"歹","⺞":"歹","青":"靑","⻘":"靑","黄":"黃","⻩":"黃","彑":"彐","⺔":"彐","⺕":"彐","丬":"爿","⺦":"爿","夊":"夂","巛":"川","㔾":"卩","⺋":"卩","镸":"長","⻑":"長","⻒":"長","⻓":"長","见":"見","⻅":"見","贝":"貝","⻉":"貝","车":"車","⻋":"車","马":"馬","⻢":"馬","鸟":"鳥","⻦":"鳥","鱼":"魚","⻥":"魚","门":"門","⻔":"門","页":"頁","⻚":"頁","风":"風","⻛":"風","飞":"飛","⻜":"飛","龙":"龍","⻯":"龍","⻰":"龍","麦":"麥","⻨":"麥","黾":"黽","⻪":"黽","齿":"齒","歯":"齒","⻭":"齒","⻮":"齒","韦":"韋","⻙":"韋","龟":"龜","亀":"龜","⻱":"龜","⻲":"龜","⻳":"龜","齐":"齊","斉":"齊","⻫":"齊","⻬":"齊","卤":"鹵","⻧":"鹵","⻣":"骨","⻤":"鬼","⻡":"首","⻆":"角","⻇":"角","⺽":"臼","⺺":"聿","⺻":"聿","覀":"襾","⻃":"襾","⻄":"襾","⻁":"虍","⺪":"疋","⺫":"目","⺶":"羊","⺷":"羊","⺸":"羊","𦍌":"羊","⺆":"冂","⺟":"毋","⺒":"巳","⺓":"幺","⺛":"旡","⺁":"厂","⺂":"乙","⺃":"乙","⺄":"乙","乚":"乙","⺊":"卜","⺜":"日","⺝":"月"};
  // 2つの部首の変形を兼ねる字(阝は阜・邑のどちら、王は玉偏としても使われる)
  const MULTI_OF = { '阝': ['阜', '邑'], '王': ['王', '玉'] };
  function keysOf(ch) {
    const n = normChar(ch);
    if (MULTI_OF[n]) return MULTI_OF[n];
    return [VARIANT_OF[n] || n];
  }

  function tokenize(ids) {
    return String(ids).match(/&[^&;\s]+;|[\s\S]/gu) || [];
  }

  function parseTokens(tokens) {
    let i = 0;
    function node() {
      if (i >= tokens.length) throw new Error('記述が途中で終わっています');
      const t = tokens[i++];
      if (Object.prototype.hasOwnProperty.call(ARITY, t)) {
        const children = [];
        for (let k = 0; k < ARITY[t]; k++) children.push(node());
        return { op: t, children };
      }
      return { ch: normChar(t) };
    }
    const tree = node();
    if (i !== tokens.length) throw new Error('記述の後ろに余分な字があります');
    return tree;
  }

  function parse(ids) {
    const tokens = tokenize(String(ids).trim());
    if (!tokens.length) throw new Error('記述が空です');
    return parseTokens(tokens);
  }

  function serialize(t) {
    return t.op ? t.op + t.children.map(serialize).join('') : t.ch;
  }

  // ids.txt の各記述から、地域タグ([GTV] など)や ^…$(…) の飾りを取り除く
  function cleanIds(s) {
    s = s.trim();
    if (s.indexOf('@apparent=') === 0) s = s.slice('@apparent='.length);
    else if (s[0] === '@') return '';
    return s.replace(/^\^/, '').replace(/\$?\([^)]*\)$/, '').replace(/\[[^\]]*\]$/, '').replace(/\$$/, '').trim();
  }

  function byCodePoint(a, b) { return a.codePointAt(0) - b.codePointAt(0); }

  function createDict(text) {
    const trees = new Map();     // 字 → その字の記述(木構造)の一覧
    const exactIndex = new Map(); // 記述(文字列) → 字の集合
    const seenKeys = new Map();   // 字 → 登録済みの記述(重複を除くため)
    const add = (map, key, ch) => { let s = map.get(key); if (!s) map.set(key, s = new Set()); s.add(ch); };

    String(text).split(/\r?\n/).forEach(line => {
      if (!line || line[0] === ';' || line[0] === '#') return;
      const cols = line.split('\t');
      if (cols.length < 3) return;
      const ch = normChar(cols[1].trim());
      if (!ch) return;
      for (const col of cols.slice(2)) {
        const s = cleanIds(col);
        if (!s) continue;
        let tree;
        try { tree = parse(s); } catch (e) { continue; }
        const key = serialize(tree);
        if (key === ch) continue; // それ以上分解できない字(自己参照)は捨てる
        // 複数の辞書ファイルをつなげて使うと同じ記述が重なるので、字ごとに1回だけ登録する
        let seen = seenKeys.get(ch);
        if (!seen) seenKeys.set(ch, seen = new Set());
        if (seen.has(key)) continue;
        seen.add(key);
        if (!trees.has(ch)) trees.set(ch, []);
        trees.get(ch).push(tree);
        add(exactIndex, key, ch);
      }
    });

    // 部品を、辞書にある記述でそれ以上分解できないところまで展開する
    const expandMemo = new Map();
    function expandChar(ch, visiting) {
      if (expandMemo.has(ch)) return expandMemo.get(ch);
      const list = trees.get(ch);
      if (!list || visiting.has(ch)) return { ch };
      visiting.add(ch);
      const r = expandTree(list[0], visiting);
      visiting.delete(ch);
      expandMemo.set(ch, r);
      return r;
    }
    function expandTree(t, visiting) {
      if (t.op) return { op: t.op, children: t.children.map(c => expandTree(c, visiting)) };
      return expandChar(t.ch, visiting);
    }

    let expandedIndex = null;
    function getExpandedIndex() {
      if (expandedIndex) return expandedIndex;
      expandedIndex = new Map();
      trees.forEach((list, ch) => list.forEach(t => add(expandedIndex, serialize(expandTree(t, new Set([ch]))), ch)));
      return expandedIndex;
    }

    let partsOf = null; // 字 → その字に含まれるすべての部品
    function getPartsOf() {
      if (partsOf) return partsOf;
      partsOf = new Map();
      const collect = (t, set) => { if (t.op) t.children.forEach(c => collect(c, set)); else set.add(t.ch); };
      const collectDeep = (t, set, visiting) => {
        if (t.op) { t.children.forEach(c => collectDeep(c, set, visiting)); return; }
        set.add(t.ch);
        const list = trees.get(t.ch);
        if (list && !visiting.has(t.ch)) { visiting.add(t.ch); list.forEach(x => collectDeep(x, set, visiting)); visiting.delete(t.ch); }
      };
      trees.forEach((list, ch) => {
        const set = new Set();
        list.forEach(t => { collect(t, set); collectDeep(t, set, new Set([ch])); });
        partsOf.set(ch, set);
      });
      return partsOf;
    }

    // ---------- 部首・部品による検索(rank)のための下ごしらえ ----------
    // 字ごとに「含んでいる部品とその数」を求める。
    //  ・辞書にある記述はすべて使う(地域ごとに書き方が違う記述も、どれか1つに含まれていれば含むとみなす)。
    //  ・部品はさらに細かい部品まで分解する(殺 → 殳 → 几・又)。
    //  ・形が同じ仲間の部品(言と訁、水と氵など)は、同じ部品として数える(下の VARIANT_OF)。
    const statMemo = new Map(); // 字 → { counts, direct, leaf, terms }
    const bump = (m, k, n) => m.set(k, (m.get(k) || 0) + (n || 1));
    const mergeMax = (to, from) => from.forEach((n, k) => { if ((to.get(k) || 0) < n) to.set(k, n); });
    function charStats(ch, visiting) {
      if (statMemo.has(ch)) return statMemo.get(ch);
      const list = trees.get(ch);
      if (!list || visiting.has(ch)) return null; // それ以上分解できない部品
      visiting.add(ch);
      const counts = new Map(), direct = new Map();
      let leaf = Infinity, terms = null;
      list.forEach(tree => {
        const c = new Map(), d = new Map(), tm = new Map();
        let lf = 0;
        const walk = t => {
          if (t.op) { t.children.forEach(walk); return; }
          const keys = keysOf(t.ch);
          keys.forEach(k => { bump(c, k); bump(d, k); });
          const sub = charStats(t.ch, visiting);
          if (sub) { sub.counts.forEach((n, k) => bump(c, k, n)); sub.terms.forEach((n, k) => bump(tm, k, n)); lf += sub.leaf; }
          else { keys.forEach(k => bump(tm, k)); lf += 1; }
        };
        walk(tree);
        mergeMax(counts, c);
        mergeMax(direct, d);
        if (lf < leaf) { leaf = lf; terms = tm; } // 最も細かく単純に分けた記述の、末端の部品
      });
      visiting.delete(ch);
      const s = { counts, direct, leaf, terms };
      statMemo.set(ch, s);
      return s;
    }
    let inverted = null; // 部品(の仲間の代表) → その部品を含む字
    function getStats() {
      if (inverted) return statMemo;
      inverted = new Map();
      trees.forEach((_, ch) => {
        const s = charStats(ch, new Set());
        if (s) s.counts.forEach((_, k) => { let a = inverted.get(k); if (!a) inverted.set(k, a = []); a.push(ch); });
      });
      return statMemo;
    }

    return {
      size: trees.size,
      // 部首・部品を並べて渡すと、それを多く含む字から順に返す(記述文字は使わない)。
      // 同じ部品を2回渡すと「2つ含む」の意味になる(例:木木 → 林・森が上位)。
      // 形が同じ仲間の部品(訁と言など)は同じものとして扱い、細かく分けて入れても見つかる(几・又 → 殺)。
      // 逆に、まとまった部品で入れても、その部品を細かく分けて書いてある字が見つかる。
      // 返り値:[{ ch, matched: 含んでいた部品の数, total: 渡した部品の数 }, …]
      rank(parts, limit) {
        const want = new Map();
        parts.map(normChar).filter(p => p && !Object.prototype.hasOwnProperty.call(ARITY, p) && p.trim())
          .forEach(p => want.set(p, (want.get(p) || 0) + 1));
        const total = Array.from(want.values()).reduce((a, b) => a + b, 0);
        if (!total) return [];
        const st = getStats();
        const queries = Array.from(want, ([p, k]) => {
          const s = charStats(p, new Set());
          return { k, keys: keysOf(p), terms: s ? s.terms : null };
        });
        const queryKeys = new Set(queries.flatMap(q => q.keys));
        const candidates = new Set();
        queries.forEach(q => {
          q.keys.forEach(key => (inverted.get(key) || []).forEach(ch => candidates.add(ch)));
          if (q.terms && q.terms.size) {
            // 分けて書いてある字も候補にする(末端の部品のうち、含む字が最も少ないものから探す)
            let rarest = null;
            q.terms.forEach((_, key) => { const a = inverted.get(key) || []; if (!rarest || a.length < rarest.length) rarest = a; });
            (rarest || []).forEach(ch => candidates.add(ch));
          }
        });
        const countOf = (s, keys) => keys.reduce((m, key) => Math.max(m, s.counts.get(key) || 0), 0);
        const out = [];
        candidates.forEach(ch => {
          if (keysOf(ch).some(k => queryKeys.has(k))) return; // 入力した部品そのもの(とその仲間)は結果に出さない
          const s = st.get(ch);
          if (!s) return;
          let matched = 0, direct = 0;
          queries.forEach(q => {
            let n = countOf(s, q.keys);
            if (n === 0 && q.terms && q.terms.size) {
              // まとまった部品として書かれていなくても、それを分けた部品がそろっていれば含むとみなす
              let ok = true;
              q.terms.forEach((need, key) => { if ((s.counts.get(key) || 0) < need) ok = false; });
              if (ok) n = 1;
            }
            matched += Math.min(q.k, n);
            direct += Math.min(q.k, q.keys.reduce((m, key) => Math.max(m, s.direct.get(key) || 0), 0));
          });
          if (matched > 0) out.push({ ch, matched, total, direct, leaf: s.leaf });
        });
        // 含む部品が多い順 → 部品が字の直下にある順 → 形が単純な順 → 文字コード順
        out.sort((a, b) => (b.matched - a.matched) || (b.direct - a.direct) || (a.leaf - b.leaf) || byCodePoint(a.ch, b.ch));
        return (typeof limit === 'number' ? out.slice(0, limit) : out).map(r => ({ ch: r.ch, matched: r.matched, total: r.total }));
      },
      lookup(ids) {
        const tree = parse(ids);
        const exact = Array.from(exactIndex.get(serialize(tree)) || []).sort(byCodePoint);
        const exactSet = new Set(exact);
        const expKey = serialize(expandTree(tree, new Set()));
        const expanded = Array.from(getExpandedIndex().get(expKey) || []).filter(c => !exactSet.has(c)).sort(byCodePoint);
        return { exact, expanded };
      },
      containing(parts, limit) {
        const want = parts.map(normChar).filter(Boolean);
        if (!want.length) return [];
        const out = [];
        getPartsOf().forEach((set, ch) => {
          if (want.every(p => p !== ch && set.has(p))) out.push(ch);
        });
        out.sort(byCodePoint);
        return typeof limit === 'number' ? out.slice(0, limit) : out;
      },
    };
  }

  return { ARITY, createDict, tokenize, parse, serialize, keysOf };
});
