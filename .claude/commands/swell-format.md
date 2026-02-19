# SWELL Format コマンド - SWELL装飾（Step 9）

レビュー合格済みの記事ドラフトをSWELLテーマのWordPressブロック形式HTMLに変換するコマンドです。

## プロジェクトコンテキスト

まず `CLAUDE.md` を読み、プロジェクト全体の方針を把握してください。

## システムプロンプト・テンプレートの読み込み

- `agents/writer/system-prompt.md` を読み込む（SWELL装飾ルール）
- `agents/writer/templates/swell-blocks.md` を読み込む（SWELLブロックHTML リファレンス）

## タスク

以下の記事ドラフトをSWELL装飾済みHTMLに変換してください:

**対象ファイル**: $ARGUMENTS

---

## 事前確認

### 1. 対象ファイルの確認
- `$ARGUMENTS` で指定されたファイルを読み込む
- ファイルが `-draft.md` または `-final.md` であることを確認する
- `-outline.md` の場合: 「構成案ファイルです。先に `/write-article` で記事を執筆してください」と案内する

### 2. フロントマターの取得
記事ドラフトのフロントマターから以下を取得:
- タイトル
- スラッグ
- カテゴリ
- ディスクリプション

---

## SWELL装飾の実行

### 変換ルール

`agents/writer/templates/swell-blocks.md` に従い、以下のマッピングで記事をHTMLに変換する:

| 記事の要素 | SWELLブロック |
|-----------|-------------|
| ポイント・重要点 | キャプションボックス（`is-style-onborder_ttl2`） |
| 注意事項・警告 | キャプションボックス（`is-style-caution`） |
| 補足情報・豆知識 | キャプションボックス（`is-style-memo`） |
| FAQ Q&A | FAQブロック（`loos/faq`） |
| 手順・ステップ | ステップブロック（`loos/step`） |
| 編集部コメント・おすすめ | ふきだしブロック（`loos/balloon`） |
| 比較表・データ表 | テーブルブロック（`is-style-stripes`） |
| CTA・誘導ボタン | SWELLボタンブロック（`loos/btn`） |
| チェックリスト | 装飾リスト（`is-style-check_list`） |
| メリット一覧 | 装飾リスト（`is-style-good_list`） |
| デメリット一覧 | 装飾リスト（`is-style-bad_list`） |
| 関連記事リンク | 関連記事ブロック（`loos/post-link`） |
| セクション区切り | 区切り線（`is-style-dots`） |
| 20歳未満注意喚起 | キャプションボックス（`is-style-caution`） |

### 装飾の原則（厳守）

1. **装飾は読みやすさの向上が目的** — 過度な装飾は避ける
2. **1つのH2セクションに装飾ブロックは2〜3個まで**
3. **テキストが主役** — 装飾で本文が埋もれないようにする
4. **同じタイプの装飾を連続して使わない**
5. **適正飲酒の注意喚起は必ずキャプションボックス（注意）で装飾する**

### HTML変換の手順

1. 記事ドラフトのMarkdownを読み込む
2. フロントマターを除外し、本文部分を対象にする
3. 各セクション（H2単位）ごとに変換を行う:
   - 見出し → WordPress見出しブロック（`wp:heading`）
   - 通常段落 → `<p>` タグ
   - 箇条書き → 適切な装飾リストまたは通常リスト
   - 表 → SWELLテーブルブロック
   - ポイント・注意・補足 → キャプションボックス
   - FAQ → FAQブロック
   - 手順 → ステップブロック
4. 構造化データ（JSON-LD）を生成する:
   - Article schema
   - FAQPage schema（FAQセクションがある場合）
   - HowTo schema（手順系の記事の場合）

---

## 出力形式

### SWELL装飾済みHTMLの保存

```
output/articles/[category]-[slug]-swell.html
```

### HTMLファイルの構成

```html
<!-- 構造化データ -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  ...
}
</script>

<!-- 記事本文（SWELLブロック形式） -->

<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">見出し</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>本文テキスト...</p>
<!-- /wp:paragraph -->

[... SWELLブロックが続く ...]
```

---

## 変換完了後の報告

変換完了後、以下を報告する:

```markdown
## SWELL装飾完了

- 元ファイル: output/articles/[category]-[slug]-draft.md
- 出力ファイル: output/articles/[category]-[slug]-swell.html
- 使用した装飾ブロック:
  - キャプションボックス: X個
  - FAQブロック: X問
  - ステップブロック: X個
  - ふきだし: X個
  - テーブル: X個
  - 装飾リスト: X個
  - ボタン: X個
- 構造化データ: Article / FAQPage / HowTo

### 次のステップ
WordPress に下書き入稿するには:
/publish-draft output/articles/[category]-[slug]-swell.html
```

---

## 次のステップ

SWELL装飾完了後、以下のコマンドでWordPressに入稿できます:

```
/publish-draft output/articles/[category]-[slug]-swell.html
```

## エラーハンドリング

- `$ARGUMENTS` が空の場合: `output/articles/` 内の `-draft.md` / `-final.md` ファイル一覧を表示し、選択を促す
- 指定ファイルが見つからない場合: `output/articles/` を検索する
- `-outline.md` ファイルが指定された場合: 「記事が未執筆です。先に `/write-article` を実行してください」と案内する
- `swell-blocks.md` テンプレートが見つからない場合: CLAUDE.md のSWELL装飾ルールに従って変換する

## 注意事項

- 適正飲酒の注意喚起は必ずキャプションボックス（注意）で装飾すること
- HTMLの構文エラーがないよう注意する
- WordPressブロックコメント（`<!-- wp:xxx -->` / `<!-- /wp:xxx -->`）を正確に記述する
- 構造化データのJSON-LDは有効なJSONであること
