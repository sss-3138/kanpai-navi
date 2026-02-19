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
- **H2見出し**: 競合上位記事の分析に基づき決定（固定値なし）
- **本文**: 競合上位記事の中央値以上を目安、PREP法ベース
- **一次情報**: 独自の比較・検証、実体験、オリジナルデータのうち1つ以上を必ず含める
- **内部リンク**: 最低3本、関連カテゴリへの誘導
- **構造化データ**: FAQ, HowTo, Article schema対応

### SEOルール
- KW密度の数値目標は設けない（自然さ最優先）
- メインKW: タイトル・H1・リード文（最初の200文字）・まとめに含める
- H2・本文: KWは自然な文脈で使用（機械的な挿入禁止）
- 画像alt: 画像の内容を正確に説明（KWは合致する場合のみ）
- URL: `/{category}/{slug}/` 形式（英語スラッグ）
- 引用・ソース: 統計データ・法的情報には出典を明記

## 注意事項

- 20歳未満の飲酒を推奨するコンテンツは絶対に作成しない
- 飲酒運転を助長するコンテンツは作成しない
- 過度な飲酒を推奨しない（適量飲酒を推進）
- 医学的な効能を断定しない（「〜と言われています」等の表現）
- 法令遵守（酒税法・景品表示法等）

## チーム向けセットアップ

### 初回セットアップ（新メンバー）

```bash
bash scripts/setup.sh                # 依存パッケージ・ビルド・.env復号・pre-commitフック設定
# → .env.enc が存在すれば復号を提案される（チーム共有パスフレーズが必要）
# → .env.enc がなければ .env.example からコピー → 手動でAPIキーを設定
```

### APIキーの暗号化・共有

```bash
# 1. .env にAPIキーを設定後、暗号化する
bash scripts/encrypt-env.sh          # .env → .env.enc（AES-256-CBC）
git add .env.enc && git commit       # 暗号化ファイルをGitにコミット

# 2. 新メンバーは復号する
bash scripts/decrypt-env.sh          # .env.enc → .env（パスフレーズ入力）
```

### パスフレーズ不要モード（CI/CD・自動化用）

```bash
export KANPAI_ENV_PASSPHRASE='チーム共有パスフレーズ'
# → run-mcp.sh が .env.enc を自動復号（.env の生成不要、メモリ上で処理）
```

## セキュリティ（APIキー・認証情報の管理）

### 3層の防御

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: 暗号化（保管時のセキュリティ）                     │
│  .env.enc (AES-256-CBC) → Git管理可能                      │
│  .env (平文) → .gitignore で除外 + chmod 600               │
│  credentials/ → .gitignore で除外 + chmod 700              │
├─────────────────────────────────────────────────────────┤
│  Layer 2: アクセス制御（Claude Code フック）                  │
│  guard-secrets.sh が .env / credentials/ への              │
│  Read / Bash(cat,printenv等) / Edit / Write をブロック     │
│  → MCPサーバー経由のAPIアクセスのみ許可                      │
├─────────────────────────────────────────────────────────┤
│  Layer 3: コミット防止（pre-commit フック）                   │
│  check-secrets.sh が APIキーパターンを検出してブロック         │
└─────────────────────────────────────────────────────────┘
```

### 仕組み

```
.claude/settings.json (Git管理・シークレットなし)
  ↓ bash scripts/run-mcp.sh <server>
.env (平文・chmod 600) または .env.enc (暗号化・自動復号)
  ↓ 環境変数としてメモリ上に読み込み
MCP サーバー起動（APIキーを使用）
```

### ルール

- **APIキーやトークンは `.env` ファイルにのみ設定する**（`.env` は `.gitignore` で除外済み）
- `.claude/settings.json` には**シークレットを絶対に書かない**（Git管理下のため）
- サービスアカウントJSONキーは `credentials/` ディレクトリに配置する（Git除外済み・chmod 700）
- `.env.example` にはプレースホルダー値のみを記載する（実際のキーは記載しない）
- APIキー設定後は `scripts/encrypt-env.sh` で暗号化し、`.env.enc` をGitにコミットする
- `scripts/check-secrets.sh` が pre-commit フックとして機能し、誤ったキーのコミットを検出してブロックする
- `scripts/guard-secrets.sh` が Claude Code の PreToolUse フックとして機能し、`.env` / `credentials/` への直接アクセスをブロックする

### セキュリティスクリプト一覧

| スクリプト | 役割 | 実行タイミング |
|-----------|------|--------------|
| `scripts/encrypt-env.sh` | .env → .env.enc に暗号化 | APIキー変更時に手動実行 |
| `scripts/decrypt-env.sh` | .env.enc → .env に復号 | 新メンバー初回 or 手動実行 |
| `scripts/run-mcp.sh` | .env/.env.enc を読み込みMCPサーバー起動 | MCPサーバー起動時に自動 |
| `scripts/guard-secrets.sh` | Claude Code の機密ファイルアクセスをブロック | Claude Code ツール実行時に自動 |
| `scripts/check-secrets.sh` | コミットにAPIキーが含まれていないか検査 | git commit 時に自動 |
