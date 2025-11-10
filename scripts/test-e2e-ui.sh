#!/bin/bash

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

cd "$PROJECT_ROOT/.devcontainer" && \
docker compose up -d && \
echo "🧹 Cleaning test database..." && \
docker compose exec -T db psql -U slidebar_user -d slidebar_test -c "TRUNCATE TABLE images, users, organizations CASCADE;" 2>/dev/null || echo "⚠️  Database tables not found (might be first run)" && \
docker compose exec -T app bash -c '
  cd /workspace/slide-bar && \
  echo "🚀 Starting test server..." && \
  VITE_PORT=5174 nohup ./node_modules/.bin/vite --config config/vite.config.ts --host --port 5174 > /tmp/vite-test.log 2>&1 & echo $! > /tmp/vite-test.pid && \
  sleep 5 && \
  echo "✅ Test server started" && \
  curl -s http://localhost:5174 > /dev/null && \
  echo "✅ Server is responding"
'

cd "$PROJECT_ROOT"
echo ''
echo '📺 Opening Playwright UI Mode...'
echo '⚠️  When done testing, close the UI and press Ctrl+C to stop servers'
VITE_PORT=5174 npx playwright test --config config/playwright.config.ts --ui

cd "$PROJECT_ROOT/.devcontainer"
docker compose exec -T app bash -c '
  kill $(cat /tmp/vite-test.pid) 2>/dev/null || true && \
  rm -f /tmp/vite-test.pid && \
  echo "✅ Test server stopped"
'
