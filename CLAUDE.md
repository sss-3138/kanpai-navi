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

本プロジェクトでは5つの専門エージェントがチームとして連携する。

### 1. Strategist (戦略家エージェント)
- **役割**: 市場分析・競合調査・コンテンツ戦略立案
- **プロンプト**: `agents/strategist/system-prompt.md`
- **起動コマンド**: `/strategy`, `/content-calendar`, `/competitor-analysis`

### 2. Writer (ライターエージェント)
- **役割**: SEO最適化された記事の執筆
- **プロンプト**: `agents/writer/system-prompt.md`
- **起動コマンド**: `/write-article`

### 3. Editor (編集者エージェント)
- **役割**: 記事レビュー・品質チェック・改善提案
- **プロンプト**: `agents/editor/system-prompt.md`
- **起動コマンド**: `/edit-article`

### 4. SEO Analyst (SEO分析エージェント)
- **役割**: キーワード調査・オンページSEO・内部リンク最適化
- **プロンプト**: `agents/seo-analyst/system-prompt.md`
- **起動コマンド**: `/keyword-research`

### 5. Analytics Reporter (分析レポーターエージェント)
- **役割**: 順位計測・パフォーマンス分析・月次レポート
- **プロンプト**: `agents/analytics/system-prompt.md`
- **起動コマンド**: `/check-rankings`, `/monthly-report`

## ワークフロー

### 記事作成パイプライン (End-to-End)

```
/full-pipeline で一括実行可能

[1. 戦略立案] → [2. キーワード調査] → [3. 記事執筆] → [4. 編集・レビュー] → [5. 最終出力]
 Strategist      SEO Analyst        Writer           Editor            全エージェント
```

### 個別ワークフロー

1. **戦略フェーズ**: `/strategy` → 市場分析 → コンテンツ方針決定
2. **調査フェーズ**: `/keyword-research` → KW調査 → 記事ブリーフ作成
3. **執筆フェーズ**: `/write-article` → 記事ドラフト作成
4. **編集フェーズ**: `/edit-article` → 品質レビュー → 改善
5. **計測フェーズ**: `/check-rankings` → 順位チェック → レポート

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
│       ├── write-article.md     # /write-article
│       ├── edit-article.md      # /edit-article
│       ├── check-rankings.md    # /check-rankings
│       ├── content-calendar.md  # /content-calendar
│       ├── competitor-analysis.md # /competitor-analysis
│       ├── monthly-report.md    # /monthly-report
│       └── full-pipeline.md     # /full-pipeline
├── agents/                      # エージェント定義
│   ├── strategist/              # 戦略家エージェント
│   ├── writer/                  # ライターエージェント
│   ├── editor/                  # 編集者エージェント
│   ├── seo-analyst/             # SEO分析エージェント
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
