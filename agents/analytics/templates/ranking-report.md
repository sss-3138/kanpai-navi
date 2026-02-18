# 順位レポート

> **対象期間**: {{start_date}} 〜 {{end_date}}
> **計測日**: {{measurement_date}}
> **作成者**: Analytics Reporter Agent
> **レポート種別**: {{type}} <!-- 週次 / 月次 / 臨時 -->

---

## 1. サマリー

### 全体概況

| 指標 | 今回 | 前回 | 変動 |
|:---|:---:|:---:|:---:|
| 追跡キーワード総数 | {{total_kw}} | {{prev_total}} | {{diff}} |
| Top3キーワード数 | {{top3}} | {{prev_top3}} | {{diff}} |
| Top10キーワード数 | {{top10}} | {{prev_top10}} | {{diff}} |
| Top20キーワード数 | {{top20}} | {{prev_top20}} | {{diff}} |
| Top50キーワード数 | {{top50}} | {{prev_top50}} | {{diff}} |
| 圏外キーワード数 | {{out_of_range}} | {{prev_out}} | {{diff}} |
| 平均順位 | {{avg_rank}} | {{prev_avg}} | {{diff}} |

### 順位分布

| 順位帯 | KW数 | 割合 | 前回比 |
|:---|:---:|:---:|:---:|
| 1-3位 | {{count}} | {{percent}}% | {{diff}} |
| 4-10位 | {{count}} | {{percent}}% | {{diff}} |
| 11-20位 | {{count}} | {{percent}}% | {{diff}} |
| 21-50位 | {{count}} | {{percent}}% | {{diff}} |
| 51-100位 | {{count}} | {{percent}}% | {{diff}} |
| 圏外（100位以下） | {{count}} | {{percent}}% | {{diff}} |

---

## 2. キーワード別順位表

### 2.1 カテゴリ: sake（日本酒）

| # | キーワード | 現在順位 | 前回順位 | 変動 | 検索Vol. | 対象記事 |
|:---:|:---|:---:|:---:|:---:|:---:|:---|
| 1 | {{keyword}} | {{rank}} | {{prev_rank}} | {{change}} | {{volume}} | {{article}} |
| 2 | {{keyword}} | {{rank}} | {{prev_rank}} | {{change}} | {{volume}} | {{article}} |

### 2.2 カテゴリ: whisky（ウイスキー）

| # | キーワード | 現在順位 | 前回順位 | 変動 | 検索Vol. | 対象記事 |
|:---:|:---|:---:|:---:|:---:|:---:|:---|
| 1 | {{keyword}} | {{rank}} | {{prev_rank}} | {{change}} | {{volume}} | {{article}} |
| 2 | {{keyword}} | {{rank}} | {{prev_rank}} | {{change}} | {{volume}} | {{article}} |

### 2.3 カテゴリ: gin（ジン）

| # | キーワード | 現在順位 | 前回順位 | 変動 | 検索Vol. | 対象記事 |
|:---:|:---|:---:|:---:|:---:|:---:|:---|
| 1 | {{keyword}} | {{rank}} | {{prev_rank}} | {{change}} | {{volume}} | {{article}} |

### 2.4 カテゴリ: beer（ビール）

| # | キーワード | 現在順位 | 前回順位 | 変動 | 検索Vol. | 対象記事 |
|:---:|:---|:---:|:---:|:---:|:---:|:---|
| 1 | {{keyword}} | {{rank}} | {{prev_rank}} | {{change}} | {{volume}} | {{article}} |

### 2.5 カテゴリ: wine（ワイン）

| # | キーワード | 現在順位 | 前回順位 | 変動 | 検索Vol. | 対象記事 |
|:---:|:---|:---:|:---:|:---:|:---:|:---|
| 1 | {{keyword}} | {{rank}} | {{prev_rank}} | {{change}} | {{volume}} | {{article}} |

### 2.6 その他カテゴリ（tequila, vodka, rum, liqueur, fruit-wine）

| # | カテゴリ | キーワード | 現在順位 | 前回順位 | 変動 | 検索Vol. |
|:---:|:---|:---|:---:|:---:|:---:|:---:|
| 1 | {{category}} | {{keyword}} | {{rank}} | {{prev_rank}} | {{change}} | {{volume}} |

---

## 3. 順位アップ分析

### 3.1 大幅上昇キーワード（+5位以上）

| # | キーワード | カテゴリ | 変動 | 現在順位 | 推定上昇要因 |
|:---:|:---|:---|:---:|:---:|:---|
| 1 | {{keyword}} | {{category}} | +{{change}} | {{rank}} | {{reason}} |
| 2 | {{keyword}} | {{category}} | +{{change}} | {{rank}} | {{reason}} |
| 3 | {{keyword}} | {{category}} | +{{change}} | {{rank}} | {{reason}} |

### 3.2 新規Top10ランクインキーワード

| # | キーワード | 現在順位 | 前回順位 | 検索Vol. | 対象記事 |
|:---:|:---|:---:|:---:|:---:|:---|
| 1 | {{keyword}} | {{rank}} | {{prev_rank}} | {{volume}} | {{article}} |

### 3.3 成功要因の分析

{{success_analysis}}

---

## 4. 順位ダウン分析

### 4.1 大幅下落キーワード（-5位以上）

| # | キーワード | カテゴリ | 変動 | 現在順位 | 推定下落要因 | 緊急度 |
|:---:|:---|:---|:---:|:---:|:---|:---:|
| 1 | {{keyword}} | {{category}} | {{change}} | {{rank}} | {{reason}} | {{alert_level}} |
| 2 | {{keyword}} | {{category}} | {{change}} | {{rank}} | {{reason}} | {{alert_level}} |

### 4.2 Top10圏外に落ちたキーワード

| # | キーワード | 現在順位 | 前回順位 | 検索Vol. | 推定原因 |
|:---:|:---|:---:|:---:|:---:|:---|
| 1 | {{keyword}} | {{rank}} | {{prev_rank}} | {{volume}} | {{reason}} |

### 4.3 下落原因の分析

{{decline_analysis}}

---

## 5. アクション提案

### 5.1 即時対応（緊急アラート該当）

| # | キーワード | 現状 | 推奨アクション | 担当Agent | 期限 |
|:---:|:---|:---|:---|:---|:---:|
| 1 | {{keyword}} | {{status}} | {{action}} | {{agent}} | {{deadline}} |

### 5.2 リライト推奨記事

| # | 記事タイトル | メインKW | 現在順位 | 改善ポイント | 期待効果 |
|:---:|:---|:---|:---:|:---|:---|
| 1 | {{title}} | {{keyword}} | {{rank}} | {{improvement}} | {{impact}} |
| 2 | {{title}} | {{keyword}} | {{rank}} | {{improvement}} | {{impact}} |
| 3 | {{title}} | {{keyword}} | {{rank}} | {{improvement}} | {{impact}} |

### 5.3 新規コンテンツ推奨

| # | キーワード | 検索Vol. | 機会の根拠 | 推奨アクション |
|:---:|:---|:---:|:---|:---|
| 1 | {{keyword}} | {{volume}} | {{rationale}} | {{action}} |

---

## 6. 競合動向

| 競合メディア | 新規ランクインKW | カンパイなびを追い越したKW | 注目すべき動き |
|:---|:---:|:---:|:---|
| LiquorPage | {{count}}個 | {{count}}個 | {{notes}} |
| nomooo | {{count}}個 | {{count}}個 | {{notes}} |
| SAKETIMES | {{count}}個 | {{count}}個 | {{notes}} |
| カンパイタイムズ | {{count}}個 | {{count}}個 | {{notes}} |

---

## 備考

- {{notes}}

---

*このレポートはAnalytics Reporter Agentによって作成されました。データの詳細分析が必要な場合はSEO Analyst Agentに依頼してください。*
