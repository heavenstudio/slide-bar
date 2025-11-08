#!/bin/bash

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Ensure Supabase is running
echo "🔍 Checking Supabase status..."
if ! supabase status > /dev/null 2>&1; then
  echo "🚀 Starting Supabase..."
  supabase start
else
  echo "✅ Supabase is already running"
fi

# Get Supabase connection details
SUPABASE_URL=$(supabase status | grep "API URL" | awk '{print $3}')
SUPABASE_ANON_KEY=$(supabase status | grep "anon key" | awk '{print $3}')

# Replace 127.0.0.1 with host.docker.internal for Docker containers
SUPABASE_URL_DOCKER=$(echo "$SUPABASE_URL" | sed 's/127.0.0.1/host.docker.internal/g')

echo "🧹 Cleaning Supabase test data..."
# Reset database to clean state
supabase db reset --yes 2>&1 | grep -E "(Applying migration|Finished)" || echo "⚠️  Database reset may have failed"

# Check if devcontainer app is already running
cd "$PROJECT_ROOT/.devcontainer"
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
  sleep 1
fi

# Run tests in the container
echo "🧪 Running E2E tests..."
if [ "$USE_COMPOSE" = true ]; then
  docker compose exec -T $APP_CONTAINER bash -c "
    set -e
    cd /workspace/slide-bar
    echo '🚀 Starting test server...'
    cd packages/frontend && VITE_PORT=5174 VITE_USE_SUPABASE=true VITE_SUPABASE_URL=$SUPABASE_URL_DOCKER VITE_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY nohup ./node_modules/.bin/vite --host --port 5174 > /tmp/vite-test.log 2>&1 & echo \$! > /tmp/vite-test.pid

    # Wait for frontend to be ready with fast polling (max 10 seconds)
    echo '🔍 Waiting for frontend to be ready...'
    for i in {1..20}; do
      if curl -f http://localhost:5174 > /dev/null 2>&1; then
        echo \"✅ Frontend ready (took ~\${i}/2 seconds)\"
        break
      fi
      if [ \$i -eq 20 ]; then
        echo '❌ Frontend failed to start in time'
        echo 'Frontend log:'; cat /tmp/vite-test.log
        exit 1
      fi
      sleep 0.5
    done

    cd /workspace/slide-bar
    # Install browsers if not already present (cached after first run)
    if [ ! -d \"\$HOME/.cache/ms-playwright/chromium\"* ] 2>/dev/null; then
      echo '📦 Installing Playwright browsers (first run)...'
      ./node_modules/.bin/playwright install chromium 2>/dev/null || true
    fi
    VITE_PORT=5174 ./node_modules/.bin/playwright test
    EXIT_CODE=\$?
    kill \$(cat /tmp/vite-test.pid) 2>/dev/null || true
    rm -f /tmp/vite-test.pid
    exit \$EXIT_CODE
  "
  EXIT_CODE=$?
else
  docker exec -t $APP_CONTAINER bash -c "
    set -e
    cd /workspace/slide-bar
    echo '🚀 Starting test server...'
    cd packages/frontend && VITE_PORT=5174 VITE_USE_SUPABASE=true VITE_SUPABASE_URL=$SUPABASE_URL_DOCKER VITE_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY nohup ./node_modules/.bin/vite --host --port 5174 > /tmp/vite-test.log 2>&1 & echo \$! > /tmp/vite-test.pid

    # Wait for frontend to be ready with fast polling (max 10 seconds)
    echo '🔍 Waiting for frontend to be ready...'
    for i in {1..20}; do
      if curl -f http://localhost:5174 > /dev/null 2>&1; then
        echo \"✅ Frontend ready (took ~\${i}/2 seconds)\"
        break
      fi
      if [ \$i -eq 20 ]; then
        echo '❌ Frontend failed to start in time'
        echo 'Frontend log:'; cat /tmp/vite-test.log
        exit 1
      fi
      sleep 0.5
    done

    cd /workspace/slide-bar
    # Install browsers if not already present (cached after first run)
    if [ ! -d \"\$HOME/.cache/ms-playwright/chromium\"* ] 2>/dev/null; then
      echo '📦 Installing Playwright browsers (first run)...'
      ./node_modules/.bin/playwright install chromium 2>/dev/null || true
    fi
    VITE_PORT=5174 ./node_modules/.bin/playwright test
    EXIT_CODE=\$?
    kill \$(cat /tmp/vite-test.pid) 2>/dev/null || true
    rm -f /tmp/vite-test.pid
    exit \$EXIT_CODE
  "
  EXIT_CODE=$?
  docker rm -f $APP_CONTAINER 2>/dev/null || true
fi

# Show report info
echo ""
echo "📊 Test report available at: playwright-report/"
echo "💡 To view the report, run: pnpm playwright show-report"

# Auto-open report only if tests passed
if [ $EXIT_CODE -eq 0 ]; then
  "$SCRIPT_DIR/show-report.sh"
fi

exit $EXIT_CODE
