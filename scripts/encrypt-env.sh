#!/usr/bin/env bash
# ==========================================================================
# .env 暗号化スクリプト
# ==========================================================================
# .env を AES-256-CBC で暗号化し .env.enc を生成する。
# .env.enc は Git 管理下に置ける（暗号化済みのため安全）。
#
# 使い方:
#   bash scripts/encrypt-env.sh              # 対話的にパスフレーズ入力
#   KANPAI_ENV_PASSPHRASE=xxx bash scripts/encrypt-env.sh  # 環境変数で指定
# ==========================================================================

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$PROJECT_ROOT/.env"
ENC_FILE="$PROJECT_ROOT/.env.enc"

if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: .env が見つかりません。先に .env を作成してください。"
  exit 1
fi

if [ -n "${KANPAI_ENV_PASSPHRASE:-}" ]; then
  openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 \
    -in "$ENV_FILE" -out "$ENC_FILE" \
    -pass "env:KANPAI_ENV_PASSPHRASE"
else
  echo "=== .env を暗号化します ==="
  echo "チームで共有するパスフレーズを入力してください。"
  echo ""
  openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 \
    -in "$ENV_FILE" -out "$ENC_FILE"
fi

chmod 600 "$ENC_FILE"

echo ""
echo "OK: .env.enc を作成しました。"
echo ""
echo "  暗号化ファイル: .env.enc（Git管理可能）"
echo "  元ファイル:     .env（Git除外済み・ローカルのみ）"
echo ""
echo "  チームメンバーへの共有:"
echo "  1. .env.enc を Git にコミット"
echo "  2. パスフレーズを安全な方法で共有（1Password, Slack DM 等）"
echo "  3. メンバーは scripts/decrypt-env.sh で復号"
