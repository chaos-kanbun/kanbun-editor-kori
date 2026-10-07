# 漢字検索の辞書データ

このフォルダのテキストファイルは、漢字を部品に分けて記述したデータ(IDS)です。交利の漢字検索で使っています。

## 出所とライセンス

| ファイル | 出所 | ライセンス |
|---|---|---|
| `ids.txt` | [CJKVI IDS](https://github.com/cjkvi/cjkvi-ids)(Copyright (c) 2014-2017 CJKVI Database。CHISE IDS Database に基づく) | GNU GPL v2 |
| `IDS-UCS-*.txt` | [CHISE IDS Database](https://www.chise.org/ids/)(CHISE プロジェクト) | GNU GPL v2 |
| `ids_data.js` | 上のファイルをまとめたもの | GNU GPL v2(元のデータの条件に従います) |

これらのデータは、GNU General Public License version 2 の条件のもとで再配布しています。ライセンスの全文は https://www.gnu.org/licenses/old-licenses/gpl-2.0.html にあります。元のデータの入手先は、上の表のリンクです。

## 加えた変更

`ids_data.js` は、`tools/build_ids_data.js` で上のテキストファイルをすべてまとめて作ったものです。まとめるときに、次の変更を加えています。

- 同じ字の行を1行にまとめ、互換漢字は見た目の同じ統合漢字の行にまとめました。
- 重複した記述、形の正しくない記述、自分自身を指すだけの記述を取り除きました。
- 地域タグ(`[GTV]` など)などの飾りを外し、字番号の書き方を `U+XXXX` にそろえました。
- `@apparent=` の欄を、記述として取り込みました。

元のテキストファイル(`ids.txt`・`IDS-UCS-*.txt`)には、手を加えていません。
