#!/bin/bash

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Check if report exists
if [ ! -d "$PROJECT_ROOT/playwright-report" ]; then
  echo "❌ No Playwright report found. Run 'pnpm test:e2e' first."
  exit 1
fi

# Check if port 9323 is already in use
if lsof -ti:9323 > /dev/null 2>&1; then
  echo "📊 Report server already running at http://localhost:9323"
  echo "🌐 Opening browser..."
  if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:9323
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:9323 2>/dev/null || sensible-browser http://localhost:9323 2>/dev/null || echo "Please open http://localhost:9323 in your browser"
  else
    echo "Please open http://localhost:9323 in your browser"
  fi
  exit 0
else
  echo "📊 Starting Playwright report server on host (not in Docker)..."
  # Run server in background, but keep process group alive so we can show the message
  cd "$PROJECT_ROOT"
  nohup npx playwright show-report --host 0.0.0.0 --port 9323 > /tmp/playwright-report.log 2>&1 &
  SERVER_PID=$!
  echo "⏳ Waiting for server to start..."
  sleep 3

  # Check if server started successfully
  if lsof -ti:9323 > /dev/null 2>&1; then
    echo "🌐 Opening browser..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
      open http://localhost:9323
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
      xdg-open http://localhost:9323 2>/dev/null || sensible-browser http://localhost:9323 2>/dev/null || echo "Please open http://localhost:9323 in your browser"
    else
      echo "Please open http://localhost:9323 in your browser"
    fi
    echo "✅ Report server started at http://localhost:9323"
    echo "💡 To stop the server, run: lsof -ti:9323 | xargs kill"
  else
    echo "❌ Failed to start report server. Check /tmp/playwright-report.log for details."
    exit 1
  fi
  exit 0
fi
