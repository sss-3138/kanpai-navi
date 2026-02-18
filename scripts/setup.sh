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
echo "[1/6] Node.js バージョンを確認中..."
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
echo "[2/6] ルート依存パッケージをインストール中..."
npm install
echo "  OK: ルート依存パッケージをインストールしました。"

# ----- 3. Install MCP server dependencies -----
echo ""
echo "[3/6] MCPサーバーの依存パッケージをインストール中..."

MCP_DIRS=("mcp/search-console" "mcp/serp-tracker" "mcp/keyword-research")
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
echo "[4/6] MCPサーバーをビルド中..."
for dir in "${MCP_DIRS[@]}"; do
  if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
    echo "  Building: $dir"
    (cd "$dir" && npm run build 2>/dev/null) || echo "  WARNING: $dir のビルドに失敗しました（後で手動ビルドしてください）"
  fi
done
echo "  OK: MCPサーバーのビルドが完了しました。"

# ----- 5. Create .env from .env.example -----
echo ""
echo "[5/6] 環境変数ファイルを確認中..."
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "  OK: .env.example から .env を作成しました。"
    echo "  NOTE: .env ファイルを編集してAPIキーを設定してください。"
  else
    echo "  WARNING: .env.example が見つかりません。.env を手動で作成してください。"
  fi
else
  echo "  OK: .env は既に存在します。"
fi

# ----- 6. Create necessary data directories -----
echo ""
echo "[6/6] データディレクトリを作成中..."

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
echo "  1. .env ファイルにAPIキーを設定"
echo "  2. credentials/ にサービスアカウントキーを配置"
echo "  3. Claude Code で /strategy や /write-article を実行"
echo ""
