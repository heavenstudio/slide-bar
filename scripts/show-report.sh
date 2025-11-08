#!/bin/bash

# Check if port 9323 is already in use
if lsof -ti:9323 > /dev/null 2>&1; then
  echo "📊 Report server already running at http://localhost:9323"
  echo "🌐 Opening browser..."
  # Open browser based on OS
  if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:9323
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:9323 2>/dev/null || sensible-browser http://localhost:9323 2>/dev/null || echo "Please open http://localhost:9323 in your browser"
  else
    echo "Please open http://localhost:9323 in your browser"
  fi
  exit 0
else
  echo "📊 Starting Playwright report server in background..."
  nohup npx playwright show-report > /dev/null 2>&1 &
  echo "⏳ Waiting for server to start..."
  sleep 2
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
  exit 0
fi
