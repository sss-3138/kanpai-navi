# 構造化データ検証レポート

> **検証日**: {{date}}
> **対象**: {{target}} <!-- URL または「サイト全体」 -->
> **検証者**: Technical SEO Auditor Agent

---

## 1. 検証サマリー

| スキーマ | 対象数 | 有効 | エラー | 警告 |
|:---|:---:|:---:|:---:|:---:|
| Article | {{count}} | {{valid}} | {{errors}} | {{warnings}} |
| FAQPage | {{count}} | {{valid}} | {{errors}} | {{warnings}} |
| HowTo | {{count}} | {{valid}} | {{errors}} | {{warnings}} |
| BreadcrumbList | {{count}} | {{valid}} | {{errors}} | {{warnings}} |
| **合計** | **{{total}}** | **{{valid}}** | **{{errors}}** | **{{warnings}}** |

---

## 2. エラー詳細

### 2.1 Article スキーマ

| # | URL | 問題のプロパティ | エラー内容 | 修正例 |
|:---:|:---|:---|:---|:---|
| 1 | {{url}} | {{property}} | {{error}} | {{fix_example}} |

### 2.2 FAQPage スキーマ

| # | URL | 問題のプロパティ | エラー内容 | 修正例 |
|:---:|:---|:---|:---|:---|
| 1 | {{url}} | {{property}} | {{error}} | {{fix_example}} |

### 2.3 HowTo スキーマ

| # | URL | 問題のプロパティ | エラー内容 | 修正例 |
|:---:|:---|:---|:---|:---|
| 1 | {{url}} | {{property}} | {{error}} | {{fix_example}} |

### 2.4 BreadcrumbList スキーマ

| # | URL | 問題のプロパティ | エラー内容 | 修正例 |
|:---:|:---|:---|:---|:---|
| 1 | {{url}} | {{property}} | {{error}} | {{fix_example}} |

---

## 3. Article スキーマ テンプレート

全記事で以下の JSON-LD を適用してください：

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{{title（32文字以内）}}",
  "description": "{{description（120文字以内）}}",
  "image": "{{ogp_image_url}}",
  "author": {
    "@type": "Organization",
    "name": "カンパイなび",
    "url": "https://kanpai-navi.com"
  },
  "publisher": {
    "@type": "Organization",
    "name": "カンパイなび",
    "logo": {
      "@type": "ImageObject",
      "url": "https://kanpai-navi.com/logo.png"
    }
  },
  "datePublished": "{{YYYY-MM-DD}}",
  "dateModified": "{{YYYY-MM-DD}}",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "{{canonical_url}}"
  }
}
```

---

## 4. 改善アクション

| # | 対象 | 問題 | 優先度 | 修正手順 |
|:---:|:---|:---|:---:|:---|
| 1 | {{target}} | {{issue}} | {{priority}} | {{steps}} |
| 2 | {{target}} | {{issue}} | {{priority}} | {{steps}} |
| 3 | {{target}} | {{issue}} | {{priority}} | {{steps}} |

---

*このレポートはTechnical SEO Auditor Agentによって作成されました。*
