# メタタグテンプレート

> **記事ID**: {{article_id}}
> **作成日**: {{date}}
> **対象URL**: https://kanpai-navi.com/{{slug}}/

---

## 基本メタタグ

```html
<!-- タイトルタグ（最大32文字） -->
<title>{{title}} | カンパイなび</title>

<!-- メタディスクリプション（最大120文字） -->
<meta name="description" content="{{meta_description}}">

<!-- canonical URL -->
<link rel="canonical" href="https://kanpai-navi.com/{{slug}}/">

<!-- robots -->
<meta name="robots" content="index, follow">

<!-- 言語設定 -->
<meta http-equiv="content-language" content="ja">
<link rel="alternate" hreflang="ja" href="https://kanpai-navi.com/{{slug}}/">
```

---

## OGP（Open Graph Protocol）タグ

```html
<!-- Facebook / 一般SNS -->
<meta property="og:title" content="{{og_title}}"> <!-- 最大40文字推奨 -->
<meta property="og:description" content="{{og_description}}"> <!-- 最大90文字推奨 -->
<meta property="og:type" content="article">
<meta property="og:url" content="https://kanpai-navi.com/{{slug}}/">
<meta property="og:image" content="https://kanpai-navi.com/images/{{og_image}}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:site_name" content="カンパイなび">
<meta property="og:locale" content="ja_JP">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{twitter_title}}"> <!-- 最大70文字 -->
<meta name="twitter:description" content="{{twitter_description}}"> <!-- 最大200文字 -->
<meta name="twitter:image" content="https://kanpai-navi.com/images/{{twitter_image}}">
```

---

## Schema.org 構造化データ

### Article スキーマ

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{{title}}",
  "description": "{{meta_description}}",
  "image": {
    "@type": "ImageObject",
    "url": "https://kanpai-navi.com/images/{{main_image}}",
    "width": 1200,
    "height": 630
  },
  "author": {
    "@type": "Organization",
    "name": "カンパイなび編集部",
    "url": "https://kanpai-navi.com/"
  },
  "publisher": {
    "@type": "Organization",
    "name": "カンパイなび",
    "url": "https://kanpai-navi.com/",
    "logo": {
      "@type": "ImageObject",
      "url": "https://kanpai-navi.com/images/logo.png",
      "width": 600,
      "height": 60
    }
  },
  "datePublished": "{{publish_date}}",
  "dateModified": "{{modified_date}}",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://kanpai-navi.com/{{slug}}/"
  },
  "articleSection": "{{category}}",
  "keywords": "{{keywords_comma_separated}}"
}
```

### FAQPage スキーマ

<!-- FAQ セクションがある記事に適用 -->

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "{{question_1}}",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "{{answer_1}}"
      }
    },
    {
      "@type": "Question",
      "name": "{{question_2}}",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "{{answer_2}}"
      }
    },
    {
      "@type": "Question",
      "name": "{{question_3}}",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "{{answer_3}}"
      }
    }
  ]
}
```

### HowTo スキーマ

<!-- 手順系記事（飲み方、作り方、選び方など）に適用 -->

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "{{howto_title}}",
  "description": "{{howto_description}}",
  "totalTime": "{{total_time}}",
  "estimatedCost": {
    "@type": "MonetaryAmount",
    "currency": "JPY",
    "value": "{{estimated_cost}}"
  },
  "supply": [
    {
      "@type": "HowToSupply",
      "name": "{{supply_1}}"
    }
  ],
  "tool": [
    {
      "@type": "HowToTool",
      "name": "{{tool_1}}"
    }
  ],
  "step": [
    {
      "@type": "HowToStep",
      "name": "{{step_1_name}}",
      "text": "{{step_1_text}}",
      "image": "https://kanpai-navi.com/images/{{step_1_image}}",
      "url": "https://kanpai-navi.com/{{slug}}/#step-1"
    },
    {
      "@type": "HowToStep",
      "name": "{{step_2_name}}",
      "text": "{{step_2_text}}",
      "image": "https://kanpai-navi.com/images/{{step_2_image}}",
      "url": "https://kanpai-navi.com/{{slug}}/#step-2"
    },
    {
      "@type": "HowToStep",
      "name": "{{step_3_name}}",
      "text": "{{step_3_text}}",
      "image": "https://kanpai-navi.com/images/{{step_3_image}}",
      "url": "https://kanpai-navi.com/{{slug}}/#step-3"
    }
  ]
}
```

---

## BreadcrumbList スキーマ

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "ホーム",
      "item": "https://kanpai-navi.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "{{category_name}}",
      "item": "https://kanpai-navi.com/category/{{category_slug}}/"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "{{title}}",
      "item": "https://kanpai-navi.com/{{slug}}/"
    }
  ]
}
```

---

## チェックリスト

メタタグ設定時に以下を確認してください：

- [ ] タイトルが32文字以内であること
- [ ] タイトルにメインKWが含まれていること
- [ ] メタディスクリプションが120文字以内であること
- [ ] メタディスクリプションにメインKWが含まれていること
- [ ] canonical URLが正しいこと
- [ ] OGP画像が1200x630pxであること
- [ ] og:titleとtitleが適切に設定されていること（同一でなくてもよい）
- [ ] Article スキーマの全フィールドが埋まっていること
- [ ] FAQがある場合、FAQPage スキーマが設定されていること
- [ ] 手順系記事の場合、HowTo スキーマが設定されていること
- [ ] BreadcrumbList が正しいカテゴリ階層になっていること
- [ ] datePublished と dateModified が正しい形式（ISO 8601）であること

---

*このテンプレートはWriter Agentのメタタグ設定用です。SEO Analyst Agentと連携して最適化してください。*
