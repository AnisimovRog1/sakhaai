#!/bin/bash
set -e

echo "🚀 Деплой SakhaAI..."

# 1. Git push → Railway autodeploy (server + bot)
git add -A
git diff --cached --quiet || git commit -m "deploy: $(date '+%Y-%m-%d %H:%M')"
git push

# 2. Netlify (webapp)
cd webapp
npm run build
npx netlify-cli deploy --dir=dist --prod
cd ..

echo "✅ Готово!"
