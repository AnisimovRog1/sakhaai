#!/bin/bash
set -e

echo "🚀 Деплой SakhaAI..."

# 1. Git push → Railway autodeploy (server + bot)
git add -A
git diff --cached --quiet || git commit -m "deploy: $(date '+%Y-%m-%d %H:%M')"
git push

# 2. GitHub Pages (webapp)
cd webapp
npm run build
cp dist/index.html dist/404.html
npx gh-pages -d dist
cd ..

echo "✅ Готово!"
