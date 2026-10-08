# 漢文エディタ 交利

縦書きで漢文を書くための、ブラウザで動くエディタです。振り仮名・送り仮名・訓点・上下記号(句読点・括弧)・熟字訓を付けられ、CJK統合漢字拡張A〜Jの漢字も表示・検索できます。Unicode に無い字は、部品を組み合わせて作れます。

使い方の詳しい説明は、エディタの左上にある「使い方」ボタン(`help.html`)にまとめてあります。

> **AIによる制作について**
> このサイトの構造やプログラム、説明文(このREADMEや使い方のページを含む)の大部分は、AI(Anthropic の Claude)との対話によって作られました。作者は機能や見た目の指示・確認を行い、AIがそれに沿ってプログラムを書いています。

## 主な機能

- 縦書きの入力(1字ずつのマス目、行間・字間・余白・文字サイズの設定、ページ送り)
- 振り仮名・送り仮名・訓点・上下記号・左振り仮名などの注釈、熟字訓
- 句読点・括弧を上下記号に変える/戻す、漢字以外の記号をまとめて消す
- 旧字体と新字体の変換
- 漢字検索:部首・部品を選ぶと、それを多く含む字から順に表示(形の同じ仲間の部品や、細かく分けた部品でも探せます)
- 字体組立:GlyphWiki の部品を組み合わせて、Unicode に無い字を作って本文に入れる
- 上書き保存・名前を付けて保存(.json、上書きは Chrome・Edge)・読み込み・ブラウザ内への自動の控え・印刷・PDF、表示倍率(ピンチ・Ctrl+ホイール)、ページ番号の表記の選択

## フォルダの中身

| 場所 | 内容 |
|---|---|
| `index.html` | エディタ本体 |
| `help.html` | 使い方のページ(エディタの中でウィンドウとして開きます) |
| `kanji-composer.html` | 字体組立(エディタの中でウィンドウとして開きます) |
| `js/` | 漢字検索の計算部分(検索・部首データ・辞書のまとめ)とそのテスト |
| `data/` | 漢字検索の辞書(元のテキストファイルと、それをまとめた `ids_data.js`) |
| `fonts/` | 字雲(Jigmo)フォント |
| `tools/build_ids_data.js` | `data/` のテキストファイルをまとめて `ids_data.js` を作るプログラム |
| `.github/workflows/build-dictionary.yml` | GitHub で `ids_data.js` を自動で作り直す設定 |
| `.nojekyll` | GitHub Pages でファイルをそのまま公開するための空のファイル |
| `icons/` | サイトのアイコン(ブラウザのタブ・ホーム画面に表示) |
| `manifest.webmanifest` | スマートフォンなどでホーム画面に追加したときの名前・アイコンの設定 |

## GitHub Pages で公開する手順

1. GitHub で新しいリポジトリを作り、このフォルダの中身(`.github` と `.nojekyll` を含む)をすべてアップロードします。
2. リポジトリの「Add file」→「Create new file」でファイル名に `LICENSE` と入力し、右側に出る「Choose a license template」から「GNU General Public License v3.0」を選んで保存します(下の「ライセンス」を参照)。
3. 「Settings」→「Pages」で、「Branch」を `main`、フォルダを `/ (root)` にして保存します。数分後に、表示されたアドレスでサイトが開けるようになります。
4. 辞書を自動で作り直す機能を使う場合は、「Settings」→「Actions」→「General」の「Workflow permissions」を「Read and write permissions」にします。

辞書のテキストファイル(`data/*.txt`)を追加・変更して GitHub に上げると、`data/ids_data.js` が自動で作り直されます。パソコンで作り直すときは、Node.js で `node tools/build_ids_data.js` を実行します。

## 外部とのやりとり

サイトは利用者のブラウザの中だけで動き、入力した文章をサーバーに送ることはありません。自動の控えも、利用者のブラウザの中(IndexedDB)にだけ置かれます。次のものだけ、インターネットから読み込みます。

- 画面の書体(Google Fonts の Noto Sans JP)
- 字体組立を開いたとき:kage-engine(unpkg / jsDelivr から読み込み)、GlyphWiki の部品の画像と字形データ(kage-editor の作者が公開している中継サーバーを経由)

中継サーバーは第三者が運営しているもので、将来使えなくなる可能性があります。そのときは、字体組立の部品の検索・取り込みができなくなります(ほかの機能には影響しません)。

## ライセンス

このリポジトリには、ライセンスの異なるものが含まれています。

| 対象 | ライセンス |
|---|---|
| 交利のプログラム(`index.html`・`help.html`・`kanji-composer.html`・`js/`・`tools/` など) | GNU GPL-3.0-only |
| 漢字検索の辞書データ(`data/`) | GNU GPL v2(元のデータの条件に従います。詳しくは `data/README.md`) |
| 字雲フォント(`fonts/`) | CC0 1.0(詳しくは `fonts/README.md`) |

字体組立は kage-editor(GNU GPL-3.0-only)の部品の検索・取り込みの方法にならって作り、kage-engine(GNU GPL-3.0)を使っているため、交利のプログラムは GNU GPL-3.0-only で公開します。

辞書データ(GNU GPL v2)は、プログラムとは別の独立したデータとして、同じリポジトリに置いています。プログラムは辞書データを読み込んで使うだけで、辞書データは元の GNU GPL v2 の条件のまま再配布しています(出所と加えた変更は `data/README.md` に記載しています)。

## クレジット

本サイトでは、以下の第三者によるソフトウェア、データ、フォント等を利用しています。

- [字雲(Jigmo)](https://kamichikoichi.github.io/jigmo/) — 上地宏一。CC0 1.0
- [CHISE IDS Database](https://www.chise.org/ids/) — CHISE プロジェクト。GNU GPL v2
- [CJKVI IDS](https://github.com/cjkvi/cjkvi-ids) — CJKVI Database(CHISE IDS Database に基づく)。GNU GPL v2
- [kage-engine](https://github.com/kurgm/kage-engine) — 上地宏一・kurgm。GNU GPL-3.0
- [kage-editor](https://github.com/kurgm/kage-editor) — kurgm。GNU GPL-3.0-only
- [GlyphWiki](https://glyphwiki.org/) — 部品の字形データ([GlyphWiki:License](https://glyphwiki.org/wiki/GlyphWiki:License) に従います)
- [Noto Sans JP](https://fonts.google.com/noto/specimen/Noto+Sans+JP) — SIL Open Font License 1.1

## テスト(開発者向け)

Node.js が入っていれば、`js` フォルダで次のコマンドを実行するとテストが走ります。

```
node ids_core.test.js    漢字の組み立てデータの読み込み・部首データ
node ids_rank.test.js    部首・部品による検索(仲間の部品・細かい分解を含む)
node ids_merge.test.js   複数の辞書をまとめる処理
```
