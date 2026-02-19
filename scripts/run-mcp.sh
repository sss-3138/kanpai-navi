#!/usr/bin/env bash
# ==========================================================================
# MCP サーバー起動ラッパー
# ==========================================================================
# プロジェクトルートの .env を読み込んでから MCP サーバーを起動する。
# .env が存在しない場合は .env.enc を自動復号する。
# .claude/settings.json から呼び出される。
#
# 使い方:
#   scripts/run-mcp.sh mcp/google-analytics/dist/index.js
#
# 環境変数の読み込み優先順位:
#   1. .env（平文、chmod 600）
#   2. .env.enc（暗号化、KANPAI_ENV_PASSPHRASE で復号）
# ==========================================================================

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

ENV_FILE="$PROJECT_ROOT/.env"
ENC_FILE="$PROJECT_ROOT/.env.enc"

load_env_lines() {
  # ファイルの内容を環境変数として読み込む（コメント・空行はスキップ）
  local file="$1"
  set -a
  while IFS= read -r line || [ -n "$line" ]; do
    case "$line" in
      \#*|"") continue ;;
    esac
    eval "$line"
  done < "$file"
  set +a
}

if [ -f "$ENV_FILE" ]; then
  # .env が存在すればそのまま読み込む
  load_env_lines "$ENV_FILE"
elif [ -f "$ENC_FILE" ]; then
  # .env.enc を復号してメモリ上で読み込む（平文ファイルは作らない）
  if [ -z "${KANPAI_ENV_PASSPHRASE:-}" ]; then
    echo "ERROR: .env が見つかりません。.env.enc の復号に KANPAI_ENV_PASSPHRASE 環境変数が必要です。" >&2
    echo "  export KANPAI_ENV_PASSPHRASE='チーム共有パスフレーズ'" >&2
    echo "  または: bash scripts/decrypt-env.sh で .env を生成してください。" >&2
    exit 1
  fi
  DECRYPTED=$(openssl enc -aes-256-cbc -d -pbkdf2 -iter 100000 \
    -in "$ENC_FILE" -pass "env:KANPAI_ENV_PASSPHRASE" 2>/dev/null) || {
    echo "ERROR: .env.enc の復号に失敗しました。パスフレーズを確認してください。" >&2
    exit 1
  }
  set -a
  while IFS= read -r line || [ -n "$line" ]; do
    case "$line" in
      \#*|"") continue ;;
    esac
    eval "$line"
  done <<< "$DECRYPTED"
  set +a
else
  echo "WARNING: .env も .env.enc も見つかりません。APIキーなしで起動します。" >&2
fi

# MCP サーバーを起動
exec node "$@"
