# 記事構成テンプレート

> **記事ID**: {{article_id}}
> **作成日**: {{date}}
> **作成者**: Writer Agent
> **ステータス**: {{status}} <!-- draft / review / revision / approved / published -->

---

## メタ情報

| 項目 | 内容 |
|:---|:---|
| **タイトル（title）** | {{title}} <!-- 最大32文字。メインKWを含む --> |
| **メタディスクリプション** | {{description}} <!-- 最大120文字。メインKWを含む --> |
| **スラッグ（slug）** | {{slug}} <!-- 英数字・ハイフン。例: japanese-sake-beginners-guide --> |
| **カテゴリ** | {{category}} <!-- sake/whisky/gin/tequila/vodka/rum/liqueur/fruit-wine/beer/wine --> |
| **メインKW** | {{main_keyword}} |
| **サブKW** | {{sub_keywords}} <!-- カンマ区切り --> |
| **関連KW** | {{related_keywords}} <!-- カンマ区切り --> |
| **想定文字数** | {{target_length}}文字 |
| **ターゲット読者** | {{target_audience}} |

---

## リード文

<!-- 200〜400文字。以下の3要素を含むこと -->

### フック（読者の興味を引く一文）
{{hook}}

### 問題提起（読者の悩み・疑問への共感）
{{problem_statement}}

### 記事の約束（この記事で得られること）
{{article_promise}}

---

## 本文

### H2: {{heading_1}}
<!-- メインKWまたはサブKWを含む見出し -->

#### H3: {{subheading_1_1}}

{{content}}
<!-- PREP法: Point → Reason → Example → Point -->

#### H3: {{subheading_1_2}}

{{content}}

<!-- [画像挿入指示: {{image_description}}, alt="{{alt_text}}"] -->

---

### H2: {{heading_2}}

#### H3: {{subheading_2_1}}

{{content}}

#### H3: {{subheading_2_2}}

{{content}}

---

### H2: {{heading_3}}

#### H3: {{subheading_3_1}}

{{content}}

<!-- [表の挿入: {{table_description}}] -->

| {{col1}} | {{col2}} | {{col3}} |
|:---|:---|:---|
| {{data}} | {{data}} | {{data}} |

---

### H2: {{heading_4}}

#### H3: {{subheading_4_1}}

{{content}}

#### H3: {{subheading_4_2}}

{{content}}

---

### H2: {{heading_5}}

#### H3: {{subheading_5_1}}

{{content}}

---

<!-- 必要に応じてH2を追加（最大8つまで） -->

### H2: {{heading_6}}（任意）

{{content}}

---

### H2: {{heading_7}}（任意）

{{content}}

---

### H2: {{heading_8}}（任意）

{{content}}

---

## FAQ

<!-- 3〜5個のQ&A。Schema.org FAQPage markup対応 -->

<!-- schema: FAQPage -->

### Q1: {{question_1}}

**A**: {{answer_1}}

### Q2: {{question_2}}

**A**: {{answer_2}}

### Q3: {{question_3}}

**A**: {{answer_3}}

### Q4: {{question_4}}（任意）

**A**: {{answer_4}}

### Q5: {{question_5}}（任意）

**A**: {{answer_5}}

<!-- /schema: FAQPage -->

---

## まとめ

<!-- 200〜300文字。以下を含むこと -->

### 記事の要点
{{summary_points}}
<!-- 箇条書きで3〜5点にまとめる -->

### CTA（次のアクション）
{{cta}}
<!-- 読者に次に取ってほしい行動を提示 -->

---

## 関連記事リンク

<!-- カンパイなび内の関連記事を3〜5本リンク -->

- [{{related_title_1}}](https://kanpai-navi.com/{{slug_1}}/) - {{brief_description_1}}
- [{{related_title_2}}](https://kanpai-navi.com/{{slug_2}}/) - {{brief_description_2}}
- [{{related_title_3}}](https://kanpai-navi.com/{{slug_3}}/) - {{brief_description_3}}
- [{{related_title_4}}](https://kanpai-navi.com/{{slug_4}}/) - {{brief_description_4}}（任意）
- [{{related_title_5}}](https://kanpai-navi.com/{{slug_5}}/) - {{brief_description_5}}（任意）

---

## 注意喚起

> お酒は20歳になってから。適量を楽しみましょう。飲酒運転は法律で禁止されています。
> 妊娠中や授乳期の飲酒は、胎児・乳児の発育に悪影響を与えるおそれがあります。

---

## 執筆メモ（内部用・非公開）

- **参考資料**: {{references}}
- **内部リンク設置数**: {{internal_link_count}}本
- **KW密度チェック**: メインKW {{keyword_density}}%
- **Schema markup**: {{schema_types}} <!-- Article, FAQPage, HowTo -->
- **画像数**: {{image_count}}枚
- **執筆所要時間**: {{writing_time}}

---

*このテンプレートはWriter Agentの記事構成用です。執筆完了後はEditor Agentによるレビューを依頼してください。*
