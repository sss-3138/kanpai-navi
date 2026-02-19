#!/usr/bin/env bash
# ==========================================================================
# WordPress 下書き入稿スクリプト
# ==========================================================================
# SWELL装飾済みHTMLをWordPress REST APIで下書き投稿する。
#
# 使い方:
#   bash scripts/wp-publish.sh \
#     --title "記事タイトル" \
#     --slug "article-slug" \
#     --category "sake" \
#     --file "output/articles/sake-junmai-guide-swell.html"
#
# 環境変数（.env で設定）:
#   WP_SITE_URL     - WordPressサイトURL（例: https://kanpai-navi.com）
#   WP_APP_USER     - アプリケーションパスワードのユーザー名
#   WP_APP_PASSWORD - アプリケーションパスワード
# ==========================================================================

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# --- .env 読み込み ---
ENV_FILE="$PROJECT_ROOT/.env"
ENC_FILE="$PROJECT_ROOT/.env.enc"

if [ -f "$ENV_FILE" ]; then
  set -a
  while IFS= read -r line || [ -n "$line" ]; do
    case "$line" in \#*|"") continue ;; esac
    eval "$line"
  done < "$ENV_FILE"
  set +a
elif [ -f "$ENC_FILE" ] && [ -n "${KANPAI_ENV_PASSPHRASE:-}" ]; then
  DECRYPTED=$(openssl enc -aes-256-cbc -d -pbkdf2 -iter 100000 \
    -in "$ENC_FILE" -pass "env:KANPAI_ENV_PASSPHRASE" 2>/dev/null) || {
    echo "ERROR: .env.enc の復号に失敗しました。" >&2; exit 1
  }
  set -a
  while IFS= read -r line || [ -n "$line" ]; do
    case "$line" in \#*|"") continue ;; esac
    eval "$line"
  done <<< "$DECRYPTED"
  set +a
fi

# --- 引数パース ---
TITLE=""
SLUG=""
CATEGORY=""
FILE=""
DESCRIPTION=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --title) TITLE="$2"; shift 2 ;;
    --slug) SLUG="$2"; shift 2 ;;
    --category) CATEGORY="$2"; shift 2 ;;
    --file) FILE="$2"; shift 2 ;;
    --description) DESCRIPTION="$2"; shift 2 ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

# --- バリデーション ---
if [ -z "$TITLE" ] || [ -z "$FILE" ]; then
  echo "ERROR: --title と --file は必須です。" >&2
  echo "" >&2
  echo "使い方:" >&2
  echo "  bash scripts/wp-publish.sh \\" >&2
  echo "    --title \"記事タイトル\" \\" >&2
  echo "    --slug \"article-slug\" \\" >&2
  echo "    --category \"sake\" \\" >&2
  echo "    --file \"output/articles/sake-guide-swell.html\"" >&2
  exit 1
fi

if [ ! -f "$FILE" ]; then
  echo "ERROR: ファイルが見つかりません: $FILE" >&2
  exit 1
fi

if [ -z "${WP_SITE_URL:-}" ] || [ -z "${WP_APP_USER:-}" ] || [ -z "${WP_APP_PASSWORD:-}" ]; then
  echo "ERROR: WordPress認証情報が設定されていません。" >&2
  echo "  .env に以下を設定してください:" >&2
  echo "  WP_SITE_URL=https://kanpai-navi.com" >&2
  echo "  WP_APP_USER=your_username" >&2
  echo "  WP_APP_PASSWORD=your_application_password" >&2
  exit 1
fi

# --- 記事HTMLの読み込み ---
CONTENT=$(cat "$FILE")

# --- カテゴリIDの取得（指定がある場合） ---
CATEGORY_ID=""
if [ -n "$CATEGORY" ]; then
  CATEGORY_RESPONSE=$(curl -s \
    "${WP_SITE_URL}/wp-json/wp/v2/categories?slug=${CATEGORY}" \
    -u "${WP_APP_USER}:${WP_APP_PASSWORD}")

  CATEGORY_ID=$(echo "$CATEGORY_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')

  if [ -z "$CATEGORY_ID" ]; then
    echo "WARNING: カテゴリ '${CATEGORY}' が見つかりません。カテゴリなしで投稿します。" >&2
  fi
fi

# --- JSON ペイロード構築 ---
# jq が利用可能な場合はjqで、なければ手動で構築
if command -v jq &>/dev/null; then
  PAYLOAD=$(jq -n \
    --arg title "$TITLE" \
    --arg content "$CONTENT" \
    --arg slug "$SLUG" \
    --arg excerpt "$DESCRIPTION" \
    --arg category_id "$CATEGORY_ID" \
    '{
      title: $title,
      content: $content,
      status: "draft",
      slug: (if $slug != "" then $slug else null end),
      excerpt: (if $excerpt != "" then $excerpt else null end),
      categories: (if $category_id != "" then [$category_id | tonumber] else [] end)
    } | with_entries(select(.value != null))')
else
  # jq がない場合は Python で JSON エスケープ
  ESCAPED_TITLE=$(python3 -c "import json; print(json.dumps($'$TITLE'))" 2>/dev/null | sed 's/^"//;s/"$//' || echo "$TITLE")
  ESCAPED_CONTENT=$(python3 -c "import json,sys; print(json.dumps(sys.stdin.read()))" < "$FILE" 2>/dev/null || echo "\"$CONTENT\"")

  PAYLOAD="{\"title\":\"${ESCAPED_TITLE}\",\"content\":${ESCAPED_CONTENT},\"status\":\"draft\""
  [ -n "$SLUG" ] && PAYLOAD="${PAYLOAD},\"slug\":\"${SLUG}\""
  [ -n "$DESCRIPTION" ] && PAYLOAD="${PAYLOAD},\"excerpt\":\"${DESCRIPTION}\""
  [ -n "$CATEGORY_ID" ] && PAYLOAD="${PAYLOAD},\"categories\":[${CATEGORY_ID}]"
  PAYLOAD="${PAYLOAD}}"
fi

# --- WordPress REST API で下書き投稿 ---
echo "WordPress に下書き投稿中..."
echo "  サイト: ${WP_SITE_URL}"
echo "  タイトル: ${TITLE}"
[ -n "$SLUG" ] && echo "  スラッグ: ${SLUG}"
[ -n "$CATEGORY" ] && echo "  カテゴリ: ${CATEGORY} (ID: ${CATEGORY_ID:-不明})"
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "${WP_SITE_URL}/wp-json/wp/v2/posts" \
  -u "${WP_APP_USER}:${WP_APP_PASSWORD}" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 201 ]; then
  POST_ID=$(echo "$BODY" | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')
  POST_LINK=$(echo "$BODY" | grep -o '"link":"[^"]*"' | head -1 | sed 's/"link":"//;s/"//')
  EDIT_LINK="${WP_SITE_URL}/wp-admin/post.php?post=${POST_ID}&action=edit"

  echo "OK: 下書き投稿が完了しました！"
  echo ""
  echo "  投稿ID:    ${POST_ID}"
  echo "  プレビュー: ${POST_LINK}"
  echo "  編集画面:   ${EDIT_LINK}"
else
  echo "ERROR: 投稿に失敗しました。HTTP ${HTTP_CODE}" >&2
  echo "$BODY" >&2
  exit 1
fi
