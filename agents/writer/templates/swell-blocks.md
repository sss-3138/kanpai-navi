# SWELL ブロック装飾リファレンス

SWELLテーマのWordPressブロックエディタ用HTML変換リファレンス。
記事レビュー合格後、Markdown記事をこのリファレンスに従ってSWELL対応HTMLに変換する。

---

## キャプションボックス（ポイント・注意・補足）

重要な情報を視覚的に強調するボックス。

### ポイント（is-style-onborder_ttl2）
```html
<!-- wp:loos/cap-box {"className":"is-style-onborder_ttl2"} -->
<div class="swell-block-capBox is-style-onborder_ttl2"><div class="swell-block-capBox__title">ポイント</div><div class="swell-block-capBox__body">
<p>ここに強調したいポイントを記述します。</p>
</div></div>
<!-- /wp:loos/cap-box -->
```

### 注意（is-style-caution）
```html
<!-- wp:loos/cap-box {"className":"is-style-caution"} -->
<div class="swell-block-capBox is-style-caution"><div class="swell-block-capBox__title">注意</div><div class="swell-block-capBox__body">
<p>注意事項をここに記述します。「お酒は20歳になってから」の注意喚起にも使用。</p>
</div></div>
<!-- /wp:loos/cap-box -->
```

### 補足（is-style-memo）
```html
<!-- wp:loos/cap-box {"className":"is-style-memo"} -->
<div class="swell-block-capBox is-style-memo"><div class="swell-block-capBox__title">補足</div><div class="swell-block-capBox__body">
<p>補足情報をここに記述します。</p>
</div></div>
<!-- /wp:loos/cap-box -->
```

---

## FAQブロック

よくある質問セクション。FAQPage構造化データに対応。

```html
<!-- wp:loos/faq -->
<div class="swell-block-faq">
<div class="swell-block-faq__item">
  <div class="swell-block-faq__q">日本酒の「純米」と「本醸造」の違いは何ですか？</div>
  <div class="swell-block-faq__a"><p>純米酒は米と米麹のみで造られるのに対し、本醸造酒は醸造アルコールが添加されています。純米酒はふくよかな米の旨味が特徴で、本醸造酒はすっきりとした飲み口が楽しめます。</p></div>
</div>
<div class="swell-block-faq__item">
  <div class="swell-block-faq__q">次の質問テキスト</div>
  <div class="swell-block-faq__a"><p>回答テキスト</p></div>
</div>
</div>
<!-- /wp:loos/faq -->
```

---

## ステップブロック

手順・ステップを分かりやすく表示。HowTo系記事で使用。

```html
<!-- wp:loos/step -->
<div class="swell-block-step">
<div class="swell-block-step__item">
  <div class="swell-block-step__title">グラスを冷やす</div>
  <div class="swell-block-step__body"><p>グラスを冷凍庫で15分ほど冷やしておきます。冷えたグラスで飲むと、より香りが引き立ちます。</p></div>
</div>
<div class="swell-block-step__item">
  <div class="swell-block-step__title">氷を入れる</div>
  <div class="swell-block-step__body"><p>大きめの氷をグラスに入れます。溶けにくいロックアイスがおすすめです。</p></div>
</div>
<div class="swell-block-step__item">
  <div class="swell-block-step__title">ウイスキーを注ぐ</div>
  <div class="swell-block-step__body"><p>ウイスキーを30ml（シングル）注ぎます。好みに応じて量を調整してください。</p></div>
</div>
</div>
<!-- /wp:loos/step -->
```

---

## ふきだしブロック

編集部のコメントやおすすめポイントを親しみやすく表示。

```html
<!-- wp:loos/balloon {"icon":"/images/editor-icon.png","name":"編集部"} -->
<div class="swell-block-balloon">
<div class="swell-block-balloon__icon"><img src="/images/editor-icon.png" alt="カンパイなび編集部"><span class="swell-block-balloon__iconName">編集部</span></div>
<div class="swell-block-balloon__body"><p>実際に飲み比べたところ、初心者には「獺祭 純米大吟醸45」がもっとも飲みやすかったです！</p></div>
</div>
<!-- /wp:loos/balloon -->
```

---

## SWELLボタンブロック

CTAボタン。関連記事への誘導やアクション促進に使用。

```html
<!-- wp:loos/btn -->
<div class="swell-block-btn"><a href="https://kanpai-navi.com/sake/junmai-guide/" class="swell-block-btn__link">純米酒の選び方ガイドを見る</a></div>
<!-- /wp:loos/btn -->
```

---

## 装飾リスト

### チェックリスト
```html
<!-- wp:core/list {"className":"is-style-check_list"} -->
<ul class="is-style-check_list">
<li>フルーティーな香りを楽しみたい → 純米大吟醸</li>
<li>食事と合わせたい → 純米酒</li>
<li>すっきり飲みたい → 本醸造酒</li>
</ul>
<!-- /wp:core/list -->
```

### メリット（○マーク）
```html
<!-- wp:core/list {"className":"is-style-good_list"} -->
<ul class="is-style-good_list">
<li>米の旨味がしっかり感じられる</li>
<li>食事との相性が幅広い</li>
<li>温度帯を変えて楽しめる</li>
</ul>
<!-- /wp:core/list -->
```

### デメリット（×マーク）
```html
<!-- wp:core/list {"className":"is-style-bad_list"} -->
<ul class="is-style-bad_list">
<li>価格がやや高めのものが多い</li>
<li>冷蔵保管が必要</li>
</ul>
<!-- /wp:core/list -->
```

---

## テーブルブロック

比較表やデータ表。レスポンシブ対応のSWELLテーブルスタイル。

```html
<!-- wp:core/table {"className":"is-style-stripes"} -->
<figure class="wp-block-table is-style-stripes"><table><thead><tr>
<th>銘柄</th><th>種類</th><th>度数</th><th>価格帯</th><th>味わい</th>
</tr></thead><tbody>
<tr><td>獺祭 45</td><td>純米大吟醸</td><td>16%</td><td>1,500〜2,000円</td><td>フルーティー</td></tr>
<tr><td>八海山</td><td>純米吟醸</td><td>15.5%</td><td>1,800〜2,500円</td><td>すっきり</td></tr>
<tr><td>久保田 千寿</td><td>吟醸</td><td>15%</td><td>1,200〜1,500円</td><td>端麗辛口</td></tr>
</tbody></table></figure>
<!-- /wp:core/table -->
```

---

## 関連記事ブロック

カンパイなび内の関連記事へのリンクカード。

```html
<!-- wp:loos/post-link {"postId":0,"url":"https://kanpai-navi.com/sake/junmai-guide/"} -->
<div class="swell-block-postLink"><a href="https://kanpai-navi.com/sake/junmai-guide/">純米酒の選び方ガイド</a></div>
<!-- /wp:loos/post-link -->
```

---

## 区切り線

セクション間の区切り。

```html
<!-- wp:separator {"className":"is-style-dots"} -->
<hr class="wp-block-separator has-alpha-channel-opacity is-style-dots"/>
<!-- /wp:separator -->
```

---

## 装飾適用ルール

### 使い分けガイド
| 記事の要素 | 使用するブロック | 使用頻度目安 |
|-----------|----------------|-------------|
| 結論・ポイント | キャプションボックス（ポイント） | 各H2に0〜1個 |
| 注意事項・法令関連 | キャプションボックス（注意） | 必要に応じて |
| 補足・豆知識 | キャプションボックス（補足） | 適度に |
| FAQ | FAQブロック | まとめ前に1セット |
| 作り方・手順 | ステップブロック | How-to記事で |
| 編集部コメント | ふきだし | 1記事に1〜2個 |
| 商品比較 | テーブルブロック | 比較記事で |
| チェックリスト | 装飾リスト（チェック） | 選び方記事で |
| メリット/デメリット | 装飾リスト（○/×） | 比較・レビューで |
| 誘導ボタン | SWELLボタン | まとめセクションで |
| 関連記事 | 関連記事ブロック | 記事末尾に3〜5個 |

### 装飾の制約
- **1つのH2セクションに装飾ブロックは2〜3個まで**（過度な装飾を避ける）
- テキストが主役。装飾で本文が埋もれないようにする
- 同じタイプの装飾を連続して使わない
- 適正飲酒の注意喚起は**必ずキャプションボックス（注意）**で装飾する
