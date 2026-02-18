# SEO監査レポート

> **対象記事**: {{article_title}}
> **対象URL**: {{article_url}}
> **監査日**: {{audit_date}}
> **監査者**: SEO Analyst Agent

---

## 1. エグゼクティブサマリー

| 項目 | スコア | 判定 |
|:---|:---:|:---|
| **オンページSEO総合** | {{score}} / 100 | {{rating}} |
| **テクニカルSEO** | {{score}} / 100 | {{rating}} |
| **コンテンツSEO** | {{score}} / 100 | {{rating}} |
| **内部リンク** | {{score}} / 100 | {{rating}} |
| **総合スコア** | **{{total}} / 100** | **{{overall_rating}}** |

### 主要な発見事項

1. {{finding_1}}
2. {{finding_2}}
3. {{finding_3}}

---

## 2. オンページSEO分析

### 2.1 タイトルタグ

| チェック項目 | 現状 | 推奨 | スコア |
|:---|:---|:---|:---:|
| 文字数 | {{current_length}}文字 | 32文字以内 | {{score}} |
| メインKW含有 | {{yes_no}} | 必須 | {{score}} |
| KW位置 | {{position}} | 左寄せ推奨 | {{score}} |
| クリック誘引力 | {{assessment}} | 魅力的なタイトル | {{score}} |

**現在のタイトル**: `{{current_title}}`
**推奨タイトル案**: `{{recommended_title}}`

### 2.2 メタディスクリプション

| チェック項目 | 現状 | 推奨 | スコア |
|:---|:---|:---|:---:|
| 文字数 | {{current_length}}文字 | 120文字以内 | {{score}} |
| メインKW含有 | {{yes_no}} | 必須 | {{score}} |
| CTA含有 | {{yes_no}} | 推奨 | {{score}} |
| 内容の正確性 | {{assessment}} | 記事内容と一致 | {{score}} |

**現在のディスクリプション**: `{{current_description}}`
**推奨ディスクリプション案**: `{{recommended_description}}`

### 2.3 見出し構造

| レベル | 見出しテキスト | KW含有 | 評価 |
|:---|:---|:---:|:---|
| H1 | {{h1_text}} | {{yes_no}} | {{assessment}} |
| H2 | {{h2_1_text}} | {{yes_no}} | {{assessment}} |
| H2 | {{h2_2_text}} | {{yes_no}} | {{assessment}} |
| H2 | {{h2_3_text}} | {{yes_no}} | {{assessment}} |
| H2 | {{h2_4_text}} | {{yes_no}} | {{assessment}} |
| H2 | {{h2_5_text}} | {{yes_no}} | {{assessment}} |

**見出し構造の問題点**: {{heading_issues}}
**推奨改善**: {{heading_recommendations}}

### 2.4 キーワード分析

| 指標 | 現状 | 推奨範囲 | 評価 |
|:---|:---:|:---:|:---:|
| メインKW密度 | {{current}}% | 2〜4% | {{rating}} |
| メインKW出現回数 | {{count}}回 | {{recommended}}回 | {{rating}} |
| サブKW1密度 | {{current}}% | 1〜2% | {{rating}} |
| サブKW2密度 | {{current}}% | 1〜2% | {{rating}} |
| リード文のKW | {{yes_no}} | 必須 | {{rating}} |
| まとめのKW | {{yes_no}} | 推奨 | {{rating}} |

**キーワードスタッフィングの有無**: {{stuffing_check}}

### 2.5 画像SEO

| # | 画像ファイル名 | alt属性 | KW含有 | 評価 |
|:---:|:---|:---|:---:|:---|
| 1 | {{filename}} | {{alt}} | {{yes_no}} | {{assessment}} |
| 2 | {{filename}} | {{alt}} | {{yes_no}} | {{assessment}} |
| 3 | {{filename}} | {{alt}} | {{yes_no}} | {{assessment}} |

---

## 3. テクニカルSEO

### 3.1 ページ速度・Core Web Vitals

| 指標 | 現状値 | 推奨値 | 評価 |
|:---|:---:|:---:|:---:|
| LCP（Largest Contentful Paint） | {{current}} | 2.5秒以下 | {{rating}} |
| FID（First Input Delay） | {{current}} | 100ms以下 | {{rating}} |
| CLS（Cumulative Layout Shift） | {{current}} | 0.1以下 | {{rating}} |
| TTFB（Time to First Byte） | {{current}} | 800ms以下 | {{rating}} |

### 3.2 テクニカル項目

| チェック項目 | 結果 | 推奨 |
|:---|:---:|:---|
| canonical URLの設定 | {{status}} | 正しいURLが設定されていること |
| robots metaタグ | {{status}} | index, follow |
| モバイルフレンドリー | {{status}} | レスポンシブ対応 |
| HTTPS | {{status}} | SSL証明書が有効 |
| URL構造 | {{status}} | 短く、KWを含む英語スラッグ |
| パンくずリスト | {{status}} | 正しい階層構造 |
| 構造化データ（Article） | {{status}} | 必須項目が全て設定 |
| 構造化データ（FAQ） | {{status}} | FAQがある場合は必須 |
| 構造化データ（HowTo） | {{status}} | 手順記事の場合は必須 |
| 構造化データ（BreadcrumbList） | {{status}} | 推奨 |
| hreflang | {{status}} | ja設定 |

### 3.3 構造化データの検証

```
Article: {{validation_result}}
FAQPage: {{validation_result}}
HowTo: {{validation_result}}
BreadcrumbList: {{validation_result}}
```

**エラー一覧**: {{errors}}

---

## 4. コンテンツギャップ分析

### 4.1 競合との比較

| 比較項目 | カンパイなび | 競合1位 | 競合2位 | 競合3位 |
|:---|:---:|:---:|:---:|:---:|
| 文字数 | {{chars}} | {{chars}} | {{chars}} | {{chars}} |
| H2数 | {{h2}} | {{h2}} | {{h2}} | {{h2}} |
| 画像数 | {{images}} | {{images}} | {{images}} | {{images}} |
| 内部リンク数 | {{links}} | {{links}} | {{links}} | {{links}} |
| FAQ有無 | {{yes_no}} | {{yes_no}} | {{yes_no}} | {{yes_no}} |
| 表・リスト活用 | {{rating}} | {{rating}} | {{rating}} | {{rating}} |

### 4.2 カバーすべき不足トピック

| # | トピック | 競合のカバー状況 | 対応の優先度 | 推奨対応 |
|:---:|:---|:---|:---:|:---|
| 1 | {{topic}} | {{coverage}} | {{priority}} | {{action}} |
| 2 | {{topic}} | {{coverage}} | {{priority}} | {{action}} |
| 3 | {{topic}} | {{coverage}} | {{priority}} | {{action}} |
| 4 | {{topic}} | {{coverage}} | {{priority}} | {{action}} |
| 5 | {{topic}} | {{coverage}} | {{priority}} | {{action}} |

### 4.3 新たに狙えるキーワード

| # | キーワード | 検索Vol. | 現在順位 | 改善後目標 | 必要な対応 |
|:---:|:---|:---:|:---:|:---:|:---|
| 1 | {{keyword}} | {{volume}} | {{current}} | {{target}} | {{action}} |
| 2 | {{keyword}} | {{volume}} | {{current}} | {{target}} | {{action}} |
| 3 | {{keyword}} | {{volume}} | {{current}} | {{target}} | {{action}} |

---

## 5. 内部リンク分析

### 5.1 現在の内部リンク状況

| # | アンカーテキスト | リンク先URL | 関連性 | 評価 |
|:---:|:---|:---|:---:|:---|
| 1 | {{anchor}} | {{url}} | {{relevance}} | {{assessment}} |
| 2 | {{anchor}} | {{url}} | {{relevance}} | {{assessment}} |
| 3 | {{anchor}} | {{url}} | {{relevance}} | {{assessment}} |

### 5.2 追加すべき内部リンク

| # | 挿入位置 | アンカーテキスト案 | リンク先 | 目的 |
|:---:|:---|:---|:---|:---|
| 1 | {{location}} | {{anchor}} | {{url}} | {{purpose}} |
| 2 | {{location}} | {{anchor}} | {{url}} | {{purpose}} |
| 3 | {{location}} | {{anchor}} | {{url}} | {{purpose}} |

### 5.3 この記事へリンクすべき既存記事

| # | 記事タイトル | URL | 推奨アンカーテキスト |
|:---:|:---|:---|:---|
| 1 | {{title}} | {{url}} | {{anchor}} |
| 2 | {{title}} | {{url}} | {{anchor}} |
| 3 | {{title}} | {{url}} | {{anchor}} |

---

## 6. 改善アクションプラン

### 即時対応（優先度: 高）

| # | 改善項目 | 具体的アクション | 期待効果 |
|:---:|:---|:---|:---|
| 1 | {{item}} | {{action}} | {{impact}} |
| 2 | {{item}} | {{action}} | {{impact}} |
| 3 | {{item}} | {{action}} | {{impact}} |

### 短期対応（1-2週間）

| # | 改善項目 | 具体的アクション | 期待効果 |
|:---:|:---|:---|:---|
| 1 | {{item}} | {{action}} | {{impact}} |
| 2 | {{item}} | {{action}} | {{impact}} |

### 中期対応（1ヶ月以内）

| # | 改善項目 | 具体的アクション | 期待効果 |
|:---:|:---|:---|:---|
| 1 | {{item}} | {{action}} | {{impact}} |
| 2 | {{item}} | {{action}} | {{impact}} |

---

## 備考

- {{notes}}

---

*このSEO監査レポートはSEO Analyst Agentによって作成されました。改善の実施にあたってはWriter AgentおよびEditor Agentと連携してください。*
