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
  echo "🚀 Starting test servers..." && \
  (cd packages/frontend && VITE_PORT=5174 BACKEND_PORT=3002 nohup ./node_modules/.bin/vite --host --port 5174 > /tmp/vite-test.log 2>&1 & echo $! > /tmp/vite-test.pid) && \
  (cd packages/backend && DATABASE_URL=postgresql://slidebar_user:slidebar_pass@db:5432/slidebar_test?schema=public PORT=3002 nohup node src/server.js > /tmp/backend-test.log 2>&1 & echo $! > /tmp/backend-test.pid) && \
  sleep 5 && \
  echo "✅ Test servers started" && \
  curl -s http://localhost:5174 > /dev/null && \
  curl -s http://localhost:3002/api/auth/demo-login -X POST > /dev/null && \
  echo "✅ Servers are responding"
'

cd "$PROJECT_ROOT"
echo ''
echo '📺 Opening Playwright UI Mode...'
echo '⚠️  When done testing, close the UI and press Ctrl+C to stop servers'
VITE_PORT=5174 BACKEND_PORT=3002 npx playwright test --ui

cd "$PROJECT_ROOT/.devcontainer"
docker compose exec -T app bash -c '
  kill $(cat /tmp/vite-test.pid) 2>/dev/null || true && \
  kill $(cat /tmp/backend-test.pid) 2>/dev/null || true && \
  rm -f /tmp/vite-test.pid /tmp/backend-test.pid && \
  echo "✅ Test servers stopped"
'
