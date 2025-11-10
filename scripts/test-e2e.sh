#!/bin/bash

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Start TEST Supabase instance (separate from dev)
echo "🔍 Checking TEST Supabase status..."
cd "$PROJECT_ROOT/supabase"

# Check if test instance is already running
if docker ps | grep -q "supabase_db_slide-bar-test"; then
  echo "✅ TEST Supabase is already running"
else
  echo "🚀 Starting TEST Supabase instance (port 55321)..."

  # Backup current config and switch to test config
  cp config.toml config.toml.dev
  cp config.test.toml config.toml

  # Start Supabase with test config
  supabase start

  # Restore dev config
  mv config.toml.dev config.toml
fi

echo "🧹 Cleaning TEST data..."
# Clean test data via SQL using Docker exec on TEST instance
docker exec supabase_db_slide-bar-test psql -U postgres -d postgres -c "
  DELETE FROM storage.objects WHERE bucket_id = 'images';
  DELETE FROM public.images;
" 2>&1 | grep -v "DELETE" || echo "⚠️  Database cleanup may have failed"

# Ensure demo user exists in TEST instance
echo "🔐 Creating demo user in TEST instance..."
docker exec supabase_kong_slide-bar-test curl -s -X POST \
  http://supabase_auth_slide-bar-test:9999/admin/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "demodemo",
    "email_confirm": true
  }' > /dev/null 2>&1 || echo "✅ Demo user may already exist"

# Run E2E tests with Docker Compose
echo "🧪 Running E2E tests with unified Docker Compose..."
cd "$PROJECT_ROOT"

# Stop any existing E2E test containers
docker compose -f config/docker-compose.e2e.yml down 2>/dev/null || true

# Set PLAYWRIGHT_ARGS environment variable if provided
export PLAYWRIGHT_ARGS="${1:-}"

# Run tests - start containers and capture Playwright logs
docker compose -f config/docker-compose.e2e.yml up --build -d

# Wait for tests to complete by watching Playwright container
echo "⏳ Waiting for tests to complete..."
PLAYWRIGHT_CONTAINER=$(docker compose -f config/docker-compose.e2e.yml ps -q playwright 2>/dev/null)

if [ -n "$PLAYWRIGHT_CONTAINER" ]; then
  # Stream logs while tests run
  docker logs -f "$PLAYWRIGHT_CONTAINER" 2>&1 &
  LOGS_PID=$!

  # Wait for container to finish
  docker wait "$PLAYWRIGHT_CONTAINER" > /dev/null 2>&1
  EXIT_CODE=$(docker inspect "$PLAYWRIGHT_CONTAINER" --format='{{.State.ExitCode}}')

  # Stop log streaming
  kill $LOGS_PID 2>/dev/null || true
  wait $LOGS_PID 2>/dev/null || true

  # Give Playwright a moment to finish writing report files
  echo ""
  echo "📊 Copying test report from container..."
  sleep 2

  # Create .test-output directory if it doesn't exist
  mkdir -p "$PROJECT_ROOT/.test-output"

  if docker cp "$PLAYWRIGHT_CONTAINER:/workspace/slide-bar/.test-output/playwright-report" "$PROJECT_ROOT/.test-output/" 2>/dev/null; then
    echo "✅ Report copied successfully"
  else
    echo "⚠️  Warning: Could not copy report from container"
  fi

  # Copy coverage data if E2E_COVERAGE is enabled
  if [ "$E2E_COVERAGE" = "true" ]; then
    echo "📊 Copying coverage data from container..."
    if docker cp "$PLAYWRIGHT_CONTAINER:/workspace/slide-bar/.nyc_output" "$PROJECT_ROOT/" 2>/dev/null; then
      echo "✅ Coverage data copied successfully"
    else
      echo "⚠️  Warning: No coverage data found (may not have been collected)"
    fi
  fi
else
  echo "❌ Playwright container not found"
  EXIT_CODE=1
fi

# Cleanup
docker compose -f config/docker-compose.e2e.yml down

# Show report info
echo ""
if [ -d "$PROJECT_ROOT/.test-output/playwright-report" ]; then
  echo "📊 Test report available at: .test-output/playwright-report/"
  echo "💡 To view the report, run: pnpm playwright show-report"

  # Auto-open report only if tests passed AND not in CI/automated mode
  if [ $EXIT_CODE -eq 0 ] && [ -z "$CI" ] && [ -z "$E2E_COVERAGE" ]; then
    "$SCRIPT_DIR/show-report.sh"
  fi
else
  echo "⚠️  Test report not found. The volume mount may not have synced properly."
  echo "    You can still view test results in the console output above."
fi

exit $EXIT_CODE
