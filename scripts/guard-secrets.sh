#!/usr/bin/env bash
# ==========================================================================
# シークレットガード - Claude Code PreToolUse フック
# ==========================================================================
# Claude Code が .env / credentials/ などの機密ファイルに
# アクセスしようとした場合にブロックする。
#
# フック入力: stdin に JSON 形式でツール名・入力が渡される
# フック出力: ブロック時は reason を含む JSON を stdout に出力
# ==========================================================================

set -euo pipefail

# stdin から JSON を読み込む
INPUT=$(cat)

TOOL_NAME=$(echo "$INPUT" | grep -o '"tool_name"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"tool_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
# echo "DEBUG tool=$TOOL_NAME" >&2

# --- ブロック対象パターン ---

# .env / credentials/ への直接アクセスを示すファイルパス
SECRET_FILE_PATTERNS='(^|/)\.(env|env\.local|env\.enc)$|/credentials/|service-account.*\.json|\.pem$|\.key$'

# 環境変数を表示しようとする Bash コマンド
SECRET_CMD_PATTERNS='(^|\s|;|&&|\|\|)(cat|less|more|head|tail|vim?|nano|bat|code|open|cp|mv|scp|base64)\s+.*\.(env|env\.local|env\.enc)|printenv|/usr/bin/env\s*$|(^|\s|;)env(\s|$)|(^|\s|;)set(\s|$)|echo\s+\$[A-Z_]*(KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL|ACCOUNT)|process\.env|os\.environ|\$ENV\{|credentials/'

block() {
  local reason="$1"
  echo '{"exitCode":2,"stderr":"'"$reason"'"}'
  exit 2
}

case "$TOOL_NAME" in
  Bash)
    COMMAND=$(echo "$INPUT" | grep -o '"command"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"command"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
    if [ -z "$COMMAND" ]; then
      exit 0
    fi
    if echo "$COMMAND" | grep -qEi "$SECRET_CMD_PATTERNS"; then
      block "[SECURITY] .env / credentials / 環境変数への直接アクセスはブロックされました。APIキーはMCPサーバー経由で安全に利用されます。チームメンバーが直接確認する場合は scripts/decrypt-env.sh を使用してください。"
    fi
    ;;
  Read)
    FILE_PATH=$(echo "$INPUT" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
    if [ -z "$FILE_PATH" ]; then
      exit 0
    fi
    if echo "$FILE_PATH" | grep -qEi "$SECRET_FILE_PATTERNS"; then
      block "[SECURITY] 機密ファイル ($FILE_PATH) の読み取りはブロックされました。APIキーはMCPサーバー経由で安全に利用されます。"
    fi
    ;;
  Edit|Write)
    FILE_PATH=$(echo "$INPUT" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
    if [ -z "$FILE_PATH" ]; then
      exit 0
    fi
    if echo "$FILE_PATH" | grep -qEi "$SECRET_FILE_PATTERNS"; then
      block "[SECURITY] 機密ファイル ($FILE_PATH) の書き込みはブロックされました。.env の編集は直接エディタで行ってください。"
    fi
    ;;
esac

# ブロック対象でなければ許可
exit 0
