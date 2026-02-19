#!/usr/bin/env bash
# ==========================================================================
# .env 復号スクリプト
# ==========================================================================
# .env.enc を復号して .env を生成する。
# チームメンバーがリポジトリクローン後に実行する。
#
# 使い方:
#   bash scripts/decrypt-env.sh              # 対話的にパスフレーズ入力
#   KANPAI_ENV_PASSPHRASE=xxx bash scripts/decrypt-env.sh  # 環境変数で指定
# ==========================================================================

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$PROJECT_ROOT/.env"
ENC_FILE="$PROJECT_ROOT/.env.enc"

if [ ! -f "$ENC_FILE" ]; then
  echo "ERROR: .env.enc が見つかりません。"
  echo "暗号化済みの .env.enc がリポジトリにコミットされているか確認してください。"
  exit 1
fi

if [ -f "$ENV_FILE" ]; then
  echo "WARNING: .env が既に存在します。上書きしますか？ (y/N)"
  read -r REPLY
  if [[ ! "$REPLY" =~ ^[Yy]$ ]]; then
    echo "中止しました。"
    exit 0
  fi
fi

if [ -n "${KANPAI_ENV_PASSPHRASE:-}" ]; then
  openssl enc -aes-256-cbc -d -pbkdf2 -iter 100000 \
    -in "$ENC_FILE" -out "$ENV_FILE" \
    -pass "env:KANPAI_ENV_PASSPHRASE"
else
  echo "=== .env.enc を復号します ==="
  echo "チーム共有パスフレーズを入力してください。"
  echo ""
  openssl enc -aes-256-cbc -d -pbkdf2 -iter 100000 \
    -in "$ENC_FILE" -out "$ENV_FILE"
fi

# .env は所有者のみ読み書き可能にする
chmod 600 "$ENV_FILE"

echo ""
echo "OK: .env を復号しました。"
echo ""
echo "  ファイル: .env（パーミッション: 600）"
echo "  このファイルは .gitignore で除外されています。"
