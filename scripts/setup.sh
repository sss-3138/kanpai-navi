#!/usr/bin/env bash
set -euo pipefail

# =========================================================================
# カンパイなび Agent Teams - セットアップスクリプト
# =========================================================================

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo ""
echo "========================================"
echo "  カンパイなび Agent Teams セットアップ"
echo "========================================"
echo ""

# ----- 1. Check Node.js version -----
echo "[1/7] Node.js バージョンを確認中..."
if ! command -v node &> /dev/null; then
  echo "  ERROR: Node.js がインストールされていません。"
  echo "  Node.js v18以上をインストールしてください: https://nodejs.org/"
  exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "  ERROR: Node.js v18以上が必要です（現在: v$(node -v)）。"
  exit 1
fi
echo "  OK: Node.js $(node -v)"

# ----- 2. Install root dependencies -----
echo ""
echo "[2/7] ルート依存パッケージをインストール中..."
npm install
echo "  OK: ルート依存パッケージをインストールしました。"

# ----- 3. Install MCP server dependencies -----
echo ""
echo "[3/7] MCPサーバーの依存パッケージをインストール中..."

MCP_DIRS=("mcp/search-console" "mcp/serp-tracker" "mcp/keyword-research" "mcp/google-analytics" "mcp/ahrefs")
for dir in "${MCP_DIRS[@]}"; do
  if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
    echo "  Installing: $dir"
    (cd "$dir" && npm install)
  else
    echo "  SKIP: $dir (ディレクトリまたはpackage.jsonが見つかりません)"
  fi
done
echo "  OK: MCPサーバーの依存パッケージをインストールしました。"

# ----- 4. Build MCP servers -----
echo ""
echo "[4/7] MCPサーバーをビルド中..."
for dir in "${MCP_DIRS[@]}"; do
  if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
    echo "  Building: $dir"
    (cd "$dir" && npm run build 2>/dev/null) || echo "  WARNING: $dir のビルドに失敗しました（後で手動ビルドしてください）"
  fi
done
echo "  OK: MCPサーバーのビルドが完了しました。"

# ----- 5. Create .env (from .env.enc or .env.example) -----
echo ""
echo "[5/7] 環境変数ファイルを確認中..."
if [ -f ".env" ]; then
  echo "  OK: .env は既に存在します。"
elif [ -f ".env.enc" ]; then
  echo "  暗号化された .env.enc が見つかりました。復号しますか？ (Y/n)"
  read -r REPLY
  if [[ ! "$REPLY" =~ ^[Nn]$ ]]; then
    bash scripts/decrypt-env.sh
  else
    echo "  SKIP: .env の復号をスキップしました。後で scripts/decrypt-env.sh を実行してください。"
  fi
elif [ -f ".env.example" ]; then
  cp .env.example .env
  echo "  OK: .env.example から .env を作成しました。"
  echo "  NOTE: .env ファイルを編集してAPIキーを設定してください。"
else
  echo "  WARNING: .env.example が見つかりません。.env を手動で作成してください。"
fi

# .env のパーミッションを所有者のみに制限
if [ -f ".env" ]; then
  chmod 600 .env
  echo "  OK: .env のパーミッションを 600 に設定しました。"
fi

# credentials/ のパーミッションを所有者のみに制限
if [ -d "credentials" ]; then
  chmod 700 credentials/
  find credentials/ -type f -exec chmod 600 {} \; 2>/dev/null || true
  echo "  OK: credentials/ のパーミッションを制限しました。"
fi

# ----- 6. Install pre-commit hook -----
echo ""
echo "[6/7] pre-commit フックを設定中..."
if [ -f "scripts/check-secrets.sh" ]; then
  ln -sf ../../scripts/check-secrets.sh .git/hooks/pre-commit
  echo "  OK: シークレット検出フックを設定しました。"
else
  echo "  SKIP: scripts/check-secrets.sh が見つかりません。"
fi

# ----- 7. Create necessary data directories -----
echo ""
echo "[7/7] データディレクトリを作成中..."

DIRS=(
  "data/articles"
  "data/keywords"
  "data/rankings"
  "data/reports"
  "output/articles"
  "output/reports"
  "credentials"
)

for dir in "${DIRS[@]}"; do
  mkdir -p "$dir"
done

# Create .gitkeep files for output directories
touch output/.gitkeep
touch output/articles/.gitkeep
touch output/reports/.gitkeep

echo "  OK: データディレクトリを作成しました。"

# ----- Done -----
echo ""
echo "========================================"
echo "  セットアップ完了！"
echo "========================================"
echo ""
echo "  次のステップ:"
echo "  1. .env ファイルにAPIキーを設定（.env.enc から復号済みの場合は不要）"
echo "  2. credentials/ にサービスアカウントキーを配置"
echo "  3. APIキー設定後: bash scripts/encrypt-env.sh で暗号化（チーム共有用）"
echo "  4. Claude Code で /strategy や /write-article を実行"
echo ""
