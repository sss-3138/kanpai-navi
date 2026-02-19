# テクニカルSEO監査レポート

> **監査日**: {{audit_date}}
> **対象**: {{audit_scope}} <!-- サイト全体 / カテゴリ / 個別ページ -->
> **監査者**: Technical SEO Auditor Agent

---

## 1. エグゼクティブサマリー

| 監査領域 | スコア | 判定 | 重大な問題 |
|:---|:---:|:---|:---:|
| **クロール・インデックス** | {{score}} / 100 | {{rating}} | {{critical_count}}件 |
| **URL・サイト構造** | {{score}} / 100 | {{rating}} | {{critical_count}}件 |
| **Core Web Vitals** | {{score}} / 100 | {{rating}} | {{critical_count}}件 |
| **構造化データ** | {{score}} / 100 | {{rating}} | {{critical_count}}件 |
| **セキュリティ・HTTPS** | {{score}} / 100 | {{rating}} | {{critical_count}}件 |
| **総合スコア** | **{{total}} / 100** | **{{overall_rating}}** | **{{total_critical}}件** |

### 前回監査との比較

| 指標 | 前回 | 今回 | 変化 |
|:---|:---:|:---:|:---|
| 総合スコア | {{prev}} | {{current}} | {{change}} |
| 重大な問題数 | {{prev}} | {{current}} | {{change}} |
| インデックス登録率 | {{prev}}% | {{current}}% | {{change}} |

---

## 2. クロール・インデックス監査

### 2.1 インデックス状況

| 指標 | 数値 | 評価 |
|:---|:---:|:---|
| 公開ページ数 | {{total_pages}} | — |
| インデックス登録数 | {{indexed}} | {{rating}} |
| インデックス率 | {{rate}}% | {{rating}} |
| 除外ページ数 | {{excluded}} | {{rating}} |
| クロールエラー数 | {{errors}} | {{rating}} |

### 2.2 クロールエラー一覧

| # | URL | エラー種別 | 検出日 | 優先度 | 推奨対応 |
|:---:|:---|:---|:---|:---:|:---|
| 1 | {{url}} | {{error_type}} | {{date}} | {{priority}} | {{action}} |
| 2 | {{url}} | {{error_type}} | {{date}} | {{priority}} | {{action}} |
| 3 | {{url}} | {{error_type}} | {{date}} | {{priority}} | {{action}} |

### 2.3 除外ページの分析

| 除外理由 | ページ数 | 意図的か | 対応 |
|:---|:---:|:---:|:---|
| noindex指定 | {{count}} | {{yes_no}} | {{action}} |
| canonical重複 | {{count}} | {{yes_no}} | {{action}} |
| ソフト404 | {{count}} | {{yes_no}} | {{action}} |
| リダイレクト | {{count}} | {{yes_no}} | {{action}} |
| クロール済み未インデックス | {{count}} | {{yes_no}} | {{action}} |

---

## 3. URL・サイト構造

### 3.1 URL構造チェック

| チェック項目 | 結果 | 詳細 |
|:---|:---:|:---|
| `/{category}/{slug}/` パターン準拠 | {{pass_fail}} | {{details}} |
| 末尾スラッシュの統一 | {{pass_fail}} | {{details}} |
| URLの長さ（60文字以内） | {{pass_fail}} | {{details}} |
| 英語スラッグの使用 | {{pass_fail}} | {{details}} |
| canonical設定 | {{pass_fail}} | {{details}} |
| hreflang設定 | {{pass_fail}} | {{details}} |

### 3.2 サイト階層分析

| 階層 | ページ数 | 例 |
|:---|:---:|:---|
| 1クリック（トップ→カテゴリ） | {{count}} | {{example}} |
| 2クリック（カテゴリ→記事） | {{count}} | {{example}} |
| 3クリック以上 | {{count}} | {{example}} |

### 3.3 パンくずリスト

| ページ種別 | パンくず構造 | 正しいか |
|:---|:---|:---:|
| カテゴリページ | Home > {{category}} | {{pass_fail}} |
| 記事ページ | Home > {{category}} > {{article}} | {{pass_fail}} |

---

## 4. Core Web Vitals

### 4.1 サイト全体（フィールドデータ）

| 指標 | 値 | 基準 | 評価 |
|:---|:---:|:---|:---:|
| LCP | {{value}} | ≤ 2.5秒 | {{rating}} |
| INP | {{value}} | ≤ 200ms | {{rating}} |
| CLS | {{value}} | ≤ 0.1 | {{rating}} |
| TTFB | {{value}} | ≤ 800ms | {{rating}} |

### 4.2 問題のあるページ

| # | URL | LCP | INP | CLS | 主な原因 | 優先度 |
|:---:|:---|:---:|:---:|:---:|:---|:---:|
| 1 | {{url}} | {{lcp}} | {{inp}} | {{cls}} | {{cause}} | {{priority}} |
| 2 | {{url}} | {{lcp}} | {{inp}} | {{cls}} | {{cause}} | {{priority}} |
| 3 | {{url}} | {{lcp}} | {{inp}} | {{cls}} | {{cause}} | {{priority}} |

### 4.3 改善推奨事項

| # | 改善項目 | 影響指標 | 対象範囲 | 期待効果 | 実装難易度 |
|:---:|:---|:---|:---|:---|:---:|
| 1 | {{item}} | {{metric}} | {{scope}} | {{impact}} | {{difficulty}} |
| 2 | {{item}} | {{metric}} | {{scope}} | {{impact}} | {{difficulty}} |
| 3 | {{item}} | {{metric}} | {{scope}} | {{impact}} | {{difficulty}} |

---

## 5. 構造化データ

### 5.1 実装状況

| スキーマ | 対象ページ数 | 実装済み | 未実装 | エラーあり |
|:---|:---:|:---:|:---:|:---:|
| Article | {{total}} | {{ok}} | {{missing}} | {{error}} |
| FAQPage | {{total}} | {{ok}} | {{missing}} | {{error}} |
| HowTo | {{total}} | {{ok}} | {{missing}} | {{error}} |
| BreadcrumbList | {{total}} | {{ok}} | {{missing}} | {{error}} |

### 5.2 エラー・警告一覧

| # | URL | スキーマ | 問題 | 重大度 | 修正方法 |
|:---:|:---|:---|:---|:---:|:---|
| 1 | {{url}} | {{schema}} | {{issue}} | {{severity}} | {{fix}} |
| 2 | {{url}} | {{schema}} | {{issue}} | {{severity}} | {{fix}} |
| 3 | {{url}} | {{schema}} | {{issue}} | {{severity}} | {{fix}} |

---

## 6. セキュリティ・HTTPS

| チェック項目 | 結果 | 詳細 |
|:---|:---:|:---|
| SSL証明書の有効性 | {{pass_fail}} | {{details}} |
| HTTP → HTTPS リダイレクト | {{pass_fail}} | {{details}} |
| Mixed Content | {{pass_fail}} | {{details}} |
| HSTS ヘッダー | {{pass_fail}} | {{details}} |

---

## 7. サイトマップ・robots.txt

### 7.1 robots.txt

| チェック項目 | 結果 | 詳細 |
|:---|:---:|:---|
| ファイルの存在 | {{pass_fail}} | {{details}} |
| Sitemap ディレクティブ | {{pass_fail}} | {{details}} |
| 公開ページのブロック | {{pass_fail}} | {{details}} |
| 管理ページのブロック | {{pass_fail}} | {{details}} |

### 7.2 XMLサイトマップ

| チェック項目 | 結果 | 詳細 |
|:---|:---:|:---|
| ファイルの存在 | {{pass_fail}} | {{details}} |
| URL数 | {{count}} | {{details}} |
| 公開URLとの整合性 | {{pass_fail}} | 不足: {{missing}}件 / 余剰: {{extra}}件 |
| lastmod の正確性 | {{pass_fail}} | {{details}} |
| 構文の正しさ | {{pass_fail}} | {{details}} |

---

## 8. アクションプラン

### Critical（即時対応）

| # | 問題 | 影響 | 対応手順 | 対象範囲 |
|:---:|:---|:---|:---|:---|
| 1 | {{issue}} | {{impact}} | {{steps}} | {{scope}} |

### High（1週間以内）

| # | 問題 | 影響 | 対応手順 | 対象範囲 |
|:---:|:---|:---|:---|:---|
| 1 | {{issue}} | {{impact}} | {{steps}} | {{scope}} |

### Medium（1ヶ月以内）

| # | 問題 | 影響 | 対応手順 | 対象範囲 |
|:---:|:---|:---|:---|:---|
| 1 | {{issue}} | {{impact}} | {{steps}} | {{scope}} |

### Low（四半期以内）

| # | 問題 | 影響 | 対応手順 | 対象範囲 |
|:---:|:---|:---|:---|:---|
| 1 | {{issue}} | {{impact}} | {{steps}} | {{scope}} |

---

## 備考

- {{notes}}

---

*このテクニカルSEO監査レポートはTechnical SEO Auditor Agentによって作成されました。修正の実施にあたっては開発チームと連携してください。*
