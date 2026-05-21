#!/usr/bin/env bash
# ============================================================
# MY.AI — Frontend Deploy Script
# Syncs docs/index.html → frontend/index.html and pushes to GitHub
#
# Usage: bash scripts/deploy_frontend.sh
# ============================================================

set -e

REPO_DIR="/home/administrator/xiaoGua_knowledge/projects/myai"

cd "$REPO_DIR"

echo "📋 Syncing docs/index.html → frontend/index.html ..."
cp docs/index.html frontend/index.html

echo "📦 Committing changes ..."
git add docs/index.html frontend/index.html
git commit -m "chore: update frontend - $(date '+%Y-%m-%d %H:%M')" || {
  echo "⚠️  Nothing to commit (docs/index.html unchanged)"
  exit 0
}

echo "🚀 Pushing to GitHub ..."
git push origin master

echo ""
echo "✅ Deployed successfully!"
echo "🌐 Live site: https://liken00.github.io/myai/"
