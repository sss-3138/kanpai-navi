# カンパイなび - Agent Teams プロジェクト

お酒が楽しくなるトレンドメディア「カンパイなび」(https://kanpai-navi.com/) の
戦略設計・記事作成・順位計測を行うClaude Code Agent Teamsプロジェクト。

## サイト概要

- **サイト名**: カンパイなび
- **URL**: https://kanpai-navi.com/
- **コンセプト**: お酒が楽しくなるトレンドメディア
- **対象読者**: 20歳以上のお酒好き、初心者〜中級者
- **URL構造**: `/{category}/{slug}/`

## カテゴリ一覧

| カテゴリ | スラッグ | 概要 |
|---------|---------|------|
| 日本酒 | sake | 種類・選び方・銘柄・ペアリング |
| ウイスキー | whisky | 銘柄・飲み方・ペアリング |
| ジン | gin | 歴史・蒸留・クラフトジン |
| テキーラ | tequila | 歴史・銘柄・飲み方 |
| ウォッカ | vodka | カロリー・飲み方・銘柄 |
| ラム | rum | 原料・製法・銘柄 |
| リキュール | liqueur | ランキング・おつまみ |
| 果実酒 | fruit-wine | 梅酒・果実酒全般 |
| ビール | beer | クラフトビール・銘柄 |
| ワイン | wine | 選び方・ペアリング・産地 |

## Agent Team 構成

本プロジェクトでは7つの専門エージェントがチームとして連携する。

### 1. Strategist (戦略家エージェント)
- **役割**: 市場分析・競合調査・コンテンツ戦略立案
- **プロンプト**: `agents/strategist/system-prompt.md`
- **起動コマンド**: `/strategy`, `/content-calendar`, `/competitor-analysis`

### 2. SEO Analyst (SEO分析エージェント)
- **役割**: キーワード調査・オンページSEO・検索意図分析・コンテンツギャップ分析・カニバリゼーション検出・E-E-A-T評価
- **プロンプト**: `agents/seo-analyst/system-prompt.md`
- **起動コマンド**: `/keyword-research`, `/content-gap`

### 3. Technical SEO Auditor (テクニカルSEO監査エージェント)
- **役割**: クロール・インデックス監査・Core Web Vitals・構造化データ検証・サイトマップ管理
- **プロンプト**: `agents/technical-auditor/system-prompt.md`
- **起動コマンド**: `/technical-audit`

### 4. Link Analyst (被リンク分析エージェント)
- **役割**: 被リンクプロファイル分析・競合リンクギャップ・リンク獲得戦略・営業支援
- **プロンプト**: `agents/link-analyst/system-prompt.md`
- **起動コマンド**: `/backlink-analysis`

### 5. Writer (ライターエージェント)
- **役割**: SEO最適化された記事の執筆
- **プロンプト**: `agents/writer/system-prompt.md`
- **起動コマンド**: `/write-article`

### 6. Editor (編集者エージェント)
- **役割**: 記事レビュー・品質チェック・改善提案
- **プロンプト**: `agents/editor/system-prompt.md`
- **起動コマンド**: `/edit-article`

### 7. Analytics Reporter (分析レポーターエージェント)
- **役割**: 順位計測・パフォーマンス分析・月次レポート
- **プロンプト**: `agents/analytics/system-prompt.md`
- **起動コマンド**: `/check-rankings`, `/monthly-report`

## ワークフロー

### 記事作成パイプライン (End-to-End)

```
/full-pipeline で一括実行可能

[1. 戦略立案] → [2. KW調査+ギャップ分析] → [3. 記事執筆] → [4. 編集・レビュー] → [5. 最終出力]
 Strategist      SEO Analyst             Writer           Editor            全エージェント
```

### SEO改善パイプライン

```
[1. テクニカル監査] → [2. コンテンツギャップ] → [3. 被リンク分析] → [4. 改善実施] → [5. 効果計測]
 Technical Auditor    SEO Analyst            Link Analyst      Writer/Editor   Analytics Reporter
```

### 個別ワークフロー

1. **戦略フェーズ**: `/strategy` → 市場分析 → コンテンツ方針決定
2. **調査フェーズ**: `/keyword-research` → KW調査 → 記事ブリーフ作成
3. **ギャップ分析**: `/content-gap` → コンテンツギャップ・カニバリ検出
4. **執筆フェーズ**: `/write-article` → 記事ドラフト作成
5. **編集フェーズ**: `/edit-article` → 品質レビュー → 改善
6. **テクニカル監査**: `/technical-audit` → クロール・インデックス・CWV・構造化データ
7. **被リンク分析**: `/backlink-analysis` → 被リンク現状分析・競合ギャップ・営業支援
8. **計測フェーズ**: `/check-rankings` → 順位チェック → レポート

## MCP サーバー

外部ツール連携に以下のMCPサーバーを使用する。

| サーバー | 用途 | ディレクトリ |
|---------|------|------------|
| search-console | Google Search Console API連携 | `mcp/search-console/` |
| serp-tracker | SERP順位追跡 | `mcp/serp-tracker/` |
| keyword-research | キーワード調査・関連語取得 | `mcp/keyword-research/` |
| google-analytics | Google Analytics GA4 トラフィック・エンゲージメント分析 | `mcp/google-analytics/` |
| ahrefs | Ahrefs 被リンク・DR・競合ドメイン分析 | `mcp/ahrefs/` |

## ディレクトリ構造

```
kanpai-navi/
├── CLAUDE.md                    # このファイル（プロジェクト指示書）
├── .claude/
│   ├── settings.json            # Claude Code プロジェクト設定
│   └── commands/                # カスタムスラッシュコマンド
│       ├── strategy.md          # /strategy
│       ├── keyword-research.md  # /keyword-research
│       ├── content-gap.md       # /content-gap
│       ├── write-article.md     # /write-article
│       ├── edit-article.md      # /edit-article
│       ├── technical-audit.md   # /technical-audit
│       ├── backlink-analysis.md # /backlink-analysis
│       ├── check-rankings.md    # /check-rankings
│       ├── content-calendar.md  # /content-calendar
│       ├── competitor-analysis.md # /competitor-analysis
│       ├── monthly-report.md    # /monthly-report
│       └── full-pipeline.md     # /full-pipeline
├── agents/                      # エージェント定義
│   ├── strategist/              # 戦略家エージェント
│   ├── seo-analyst/             # SEO分析エージェント（コンテンツSEO+オンページSEO）
│   ├── technical-auditor/       # テクニカルSEO監査エージェント
│   ├── link-analyst/            # 被リンク分析エージェント（オフページSEO）
│   ├── writer/                  # ライターエージェント
│   ├── editor/                  # 編集者エージェント
│   └── analytics/               # 分析レポーターエージェント
├── mcp/                         # MCPサーバー
│   ├── search-console/          # Google Search Console
│   ├── serp-tracker/            # SERP追跡
│   ├── keyword-research/        # キーワード調査
│   ├── google-analytics/        # Google Analytics GA4
│   └── ahrefs/                  # Ahrefs API
├── tools/                       # ユーティリティツール
├── data/                        # データファイル
│   ├── site-config.json         # サイト設定
│   ├── categories.json          # カテゴリ定義
│   ├── seo-rules.json           # SEOルール
│   ├── keywords/                # キーワードデータ
│   ├── rankings/                # 順位データ
│   ├── articles/                # 記事メタデータ
│   └── reports/                 # レポート
├── output/                      # 生成物出力先
│   ├── articles/                # 記事ドラフト
│   └── reports/                 # レポート
└── scripts/                     # スクリプト
```

## 記事テンプレートルール

### 必須要素
- **タイトル**: 32文字以内、メインKW含む、感情トリガーあり
- **ディスクリプション**: 120文字以内、KW含む、クリック誘導
- **H2見出し**: 5〜8個、KW・共起語を自然に含める
- **本文**: 3,000〜8,000文字、PREP法ベース
- **内部リンク**: 最低3本、関連カテゴリへの誘導
- **構造化データ**: FAQ, HowTo, Article schema対応

### SEOルール
- メインKW: タイトル・H1・最初の100文字に含める
- サブKW: H2以降に自然に分散
- 画像alt: KW関連の説明的テキスト
- URL: `/{category}/{slug}/` 形式（英語スラッグ）

## 注意事項

- 20歳未満の飲酒を推奨するコンテンツは絶対に作成しない
- 飲酒運転を助長するコンテンツは作成しない
- 過度な飲酒を推奨しない（適量飲酒を推進）
- 医学的な効能を断定しない（「〜と言われています」等の表現）
- 法令遵守（酒税法・景品表示法等）

## チーム向けセットアップ

新しいメンバーがリポジトリをクローンした後、以下を実行する:

```bash
bash scripts/setup.sh     # 依存パッケージ・ビルド・.env 生成・pre-commitフック設定を一括実行
vi .env                    # APIキーを設定
```

セットアップスクリプトが行うこと:
1. Node.js バージョン確認
2. npm install（ルート＋全MCPサーバー）
3. MCPサーバーのビルド（TypeScript → JavaScript）
4. `.env.example` → `.env` のコピー
5. pre-commit フック設定（シークレット検出）
6. データディレクトリ作成

## セキュリティ（APIキー・認証情報の管理）

### 仕組み

MCPサーバーは `scripts/run-mcp.sh` ラッパー経由で起動され、`.env` を自動読み込みする。
これにより `.claude/settings.json` にAPIキーを書く必要がなく、Git管理下のファイルにシークレットが混入しない。

```
.claude/settings.json (Git管理) → scripts/run-mcp.sh → .env を読み込み → MCP サーバー起動
```

### ルール

- **APIキーやトークンは `.env` ファイルにのみ設定する**（`.env` は `.gitignore` で除外済み）
- `.claude/settings.json` には**シークレットを絶対に書かない**（Git管理下のため）
- サービスアカウントJSONキーは `credentials/` ディレクトリに配置する（Git除外済み）
- `.env.example` にはプレースホルダー値のみを記載する（実際のキーは記載しない）
- `scripts/check-secrets.sh` が pre-commit フックとして機能し、誤ったキーのコミットを検出してブロックする
