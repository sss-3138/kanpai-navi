# WordPress 下書き入稿コマンド

SWELL装飾済みの記事HTMLをWordPress REST APIで下書き投稿します。

## プロジェクトコンテキスト

まず `CLAUDE.md` を読み、プロジェクト全体の方針を把握してください。

## タスク

以下の記事をWordPressに下書き投稿してください:

**対象**: $ARGUMENTS

## 実行手順

### 1. 対象ファイルの確認
- `$ARGUMENTS` で指定されたファイルを確認する
- SWELL装飾済みHTMLファイル（`-swell.html`）が対象
- ファイルが見つからない場合は `output/articles/` を検索する

### 2. メタ情報の抽出
記事ドラフト（`-draft.md`）のフロントマターから以下を取得:
- タイトル
- スラッグ
- カテゴリ
- ディスクリプション

### 3. WordPress入稿
```bash
bash scripts/wp-publish.sh \
  --title "記事タイトル" \
  --slug "article-slug" \
  --category "カテゴリスラッグ" \
  --description "メタディスクリプション" \
  --file "output/articles/[category]-[slug]-swell.html"
```

### 4. 結果の報告
- 投稿ID
- プレビューURL
- 編集画面URL

## エラーハンドリング

- `$ARGUMENTS` が空の場合: `output/articles/` 内の `-swell.html` ファイル一覧を表示する
- SWELL装飾済みHTMLが見つからない場合: 対応する `-draft.md` があれば SWELL装飾を先に実行するか確認する
- WordPress認証エラーの場合: `.env` の `WP_SITE_URL`, `WP_APP_USER`, `WP_APP_PASSWORD` の設定を確認するよう案内する

## 前提条件

`.env` に以下の環境変数が設定されていること:
```
WP_SITE_URL=https://kanpai-navi.com
WP_APP_USER=your_username
WP_APP_PASSWORD=your_application_password
```

WordPress側でアプリケーションパスワードを生成する方法:
1. WordPress管理画面 → ユーザー → プロフィール
2. 「アプリケーションパスワード」セクションで新しいパスワードを生成
3. 生成されたパスワードを `.env` の `WP_APP_PASSWORD` に設定
