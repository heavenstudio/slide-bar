#!/bin/bash

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Ensure database is running
cd "$PROJECT_ROOT/.devcontainer"
docker compose up -d db

# Check if devcontainer app is already running
if docker compose ps app | grep -q "Up"; then
  APP_CONTAINER="app"
  USE_COMPOSE=true
  echo "✅ Using existing devcontainer app"
else
  # Start a temporary container for E2E tests (no port conflicts)
  echo "🚀 Starting temporary E2E container..."
  docker compose run -d --name slide-bar-e2e-test --rm app sleep infinity
  APP_CONTAINER="slide-bar-e2e-test"
  USE_COMPOSE=false
  sleep 2
fi

# Clean test database
echo "🧹 Cleaning test database..."
docker compose exec -T db psql -U slidebar_user -d slidebar_test -c "TRUNCATE TABLE images, users, organizations CASCADE;" 2>/dev/null || echo "⚠️  Database tables not found (might be first run)"

# Run tests in the container
echo "🧪 Running E2E tests..."
if [ "$USE_COMPOSE" = true ]; then
  docker compose exec -T $APP_CONTAINER bash -c '
    set -e
    cd /workspace/slide-bar
    echo "🚀 Starting test servers..."
    cd packages/frontend && VITE_PORT=5174 BACKEND_PORT=3001 nohup ./node_modules/.bin/vite --host --port 5174 > /tmp/vite-test.log 2>&1 & echo $! > /tmp/vite-test.pid
    cd /workspace/slide-bar/packages/backend && DATABASE_URL=postgresql://slidebar_user:slidebar_pass@db:5432/slidebar_test?schema=public PORT=3001 nohup node src/server.js > /tmp/backend-test.log 2>&1 & echo $! > /tmp/backend-test.pid
    sleep 5
    echo "✅ Test servers started"
    echo "🔍 Checking if servers are responding..."
    curl -f http://localhost:5174 > /dev/null 2>&1 || (echo "❌ Frontend not responding"; cat /tmp/vite-test.log; exit 1)
    curl -f http://localhost:3001/api/auth/demo-login -X POST > /dev/null 2>&1 || (echo "❌ Backend not responding"; cat /tmp/backend-test.log; exit 1)
    echo "✅ Servers are responding"
    cd /workspace/slide-bar
    ./node_modules/.bin/playwright install chromium > /dev/null 2>&1
    VITE_PORT=5174 BACKEND_PORT=3001 ./node_modules/.bin/playwright test
    EXIT_CODE=$?
    kill $(cat /tmp/vite-test.pid) 2>/dev/null || true
    kill $(cat /tmp/backend-test.pid) 2>/dev/null || true
    rm -f /tmp/vite-test.pid /tmp/backend-test.pid
    exit $EXIT_CODE
  '
  EXIT_CODE=$?
else
  docker exec -t $APP_CONTAINER bash -c '
    set -e
    cd /workspace/slide-bar
    echo "🚀 Starting test servers..."
    cd packages/frontend && VITE_PORT=5174 BACKEND_PORT=3001 nohup ./node_modules/.bin/vite --host --port 5174 > /tmp/vite-test.log 2>&1 & echo $! > /tmp/vite-test.pid
    cd /workspace/slide-bar/packages/backend && DATABASE_URL=postgresql://slidebar_user:slidebar_pass@db:5432/slidebar_test?schema=public PORT=3001 nohup node src/server.js > /tmp/backend-test.log 2>&1 & echo $! > /tmp/backend-test.pid
    sleep 5
    echo "✅ Test servers started"
    echo "🔍 Checking if servers are responding..."
    curl -f http://localhost:5174 > /dev/null 2>&1 || (echo "❌ Frontend not responding"; cat /tmp/vite-test.log; exit 1)
    curl -f http://localhost:3001/api/auth/demo-login -X POST > /dev/null 2>&1 || (echo "❌ Backend not responding"; cat /tmp/backend-test.log; exit 1)
    echo "✅ Servers are responding"
    cd /workspace/slide-bar
    ./node_modules/.bin/playwright install chromium > /dev/null 2>&1
    VITE_PORT=5174 BACKEND_PORT=3001 ./node_modules/.bin/playwright test
    EXIT_CODE=$?
    kill $(cat /tmp/vite-test.pid) 2>/dev/null || true
    kill $(cat /tmp/backend-test.pid) 2>/dev/null || true
    rm -f /tmp/vite-test.pid /tmp/backend-test.pid
    exit $EXIT_CODE
  '
  EXIT_CODE=$?
  docker rm -f $APP_CONTAINER 2>/dev/null || true
fi

# Show report if tests passed
if [ $EXIT_CODE -eq 0 ]; then
  "$SCRIPT_DIR/show-report.sh"
fi

exit $EXIT_CODE
