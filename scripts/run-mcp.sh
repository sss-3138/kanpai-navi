#!/usr/bin/env bash
# ==========================================================================
# MCP サーバー起動ラッパー
# ==========================================================================
# プロジェクトルートの .env を読み込んでから MCP サーバーを起動する。
# .claude/settings.json から呼び出される。
#
# 使い方:
#   scripts/run-mcp.sh mcp/google-analytics/dist/index.js
# ==========================================================================

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# .env があれば環境変数として読み込む（コメント・空行はスキップ）
ENV_FILE="$PROJECT_ROOT/.env"
if [ -f "$ENV_FILE" ]; then
  set -a
  while IFS= read -r line || [ -n "$line" ]; do
    # コメント行と空行をスキップ
    case "$line" in
      \#*|"") continue ;;
    esac
    eval "$line"
  done < "$ENV_FILE"
  set +a
fi

# MCP サーバーを起動
exec node "$@"
