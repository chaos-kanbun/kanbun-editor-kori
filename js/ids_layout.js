/*
 * ids_layout.js — 漢字構成記述(IDS)の部品が、正方形の中のどこに置かれるかを計算する
 *
 * 画面に依存しない純粋な計算です。ブラウザでは window.IDSLayout、Node.js では require で使えます。
 *   layout(tree)  ids_core.js の parse() の結果を受け取り、
 *                 { leaves: 部品の位置, frames: 記述文字ごとの枠 } を返す(座標は 0〜1)
 *   OP_INFO       記述文字の名前
 *   SLOTS         記述文字ごとの、部品の置き場所(親の枠を 0〜1 とした割合)
 * 比率は見取り図の目安で、実際の字形とは違います。
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.IDSLayout = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const OP_INFO = {
    '⿰': { name: '左右', parts: ['左', '右'] },
    '⿱': { name: '上下', parts: ['上', '下'] },
    '⿲': { name: '左中右', parts: ['左', '中', '右'] },
    '⿳': { name: '上中下', parts: ['上', '中', '下'] },
    '⿴': { name: '囲む', parts: ['外', '内'] },
    '⿵': { name: '上から囲む', parts: ['外', '内'] },
    '⿶': { name: '下から囲む', parts: ['外', '内'] },
    '⿷': { name: '左から囲む', parts: ['外', '内'] },
    '⿸': { name: '左上から囲む', parts: ['左上', '右下'] },
    '⿹': { name: '右上から囲む', parts: ['右上', '左下'] },
    '⿺': { name: '左下から囲む', parts: ['左下', '右上'] },
    '⿻': { name: '重ねる', parts: ['下', '上'] },
    '⿼': { name: '右から囲む', parts: ['外', '内'] },
    '⿽': { name: '右下から囲む', parts: ['右下', '左上'] },
    '⿾': { name: '左右反転', parts: ['元の形'] },
    '⿿': { name: '回転', parts: ['元の形'] },
    '㇯': { name: '取り除く', parts: ['元の形', '除く部分'] },
  };

  const FULL = { x: 0, y: 0, w: 1, h: 1 };
  const r = (x, y, w, h) => ({ x, y, w, h });
  const T = 1 / 3;
  const SLOTS = {
    '⿰': [r(0, 0, .5, 1), r(.5, 0, .5, 1)],
    '⿱': [r(0, 0, 1, .5), r(0, .5, 1, .5)],
    '⿲': [r(0, 0, T, 1), r(T, 0, T, 1), r(2 * T, 0, T, 1)],
    '⿳': [r(0, 0, 1, T), r(0, T, 1, T), r(0, 2 * T, 1, T)],
    '⿴': [FULL, r(.25, .25, .5, .5)],
    '⿵': [FULL, r(.25, .3, .5, .7)],
    '⿶': [FULL, r(.25, 0, .5, .7)],
    '⿷': [FULL, r(.3, .25, .7, .5)],
    '⿸': [FULL, r(.3, .3, .7, .7)],
    '⿹': [FULL, r(0, .3, .7, .7)],
    '⿺': [FULL, r(.3, 0, .7, .7)],
    '⿻': [FULL, FULL],
    '⿼': [FULL, r(0, .25, .7, .5)],
    '⿽': [FULL, r(0, 0, .7, .7)],
    '⿾': [FULL],
    '⿿': [FULL],
    '㇯': [FULL, FULL],
  };

  function layout(tree) {
    const leaves = [], frames = [];
    function walk(t, box, mods, ghost, depth) {
      if (!t.op) {
        leaves.push({ ch: t.ch, x: box.x, y: box.y, w: box.w, h: box.h, mods: mods.slice(), ghost, depth });
        return;
      }
      frames.push({ op: t.op, x: box.x, y: box.y, w: box.w, h: box.h, depth });
      const slots = SLOTS[t.op];
      let m = mods;
      if (t.op === '⿾') m = mods.concat([{ type: 'flip' }]);
      if (t.op === '⿿') m = mods.concat([{ type: 'rotate' }]);
      t.children.forEach((c, i) => {
        const s = slots[i];
        const child = { x: box.x + s.x * box.w, y: box.y + s.y * box.h, w: s.w * box.w, h: s.h * box.h };
        walk(c, child, m, ghost || (t.op === '㇯' && i === 1), depth + 1);
      });
    }
    walk(tree, { x: 0, y: 0, w: 1, h: 1 }, [], false, 0);
    return { leaves, frames };
  }

  return { OP_INFO, SLOTS, layout };
});
