#!/bin/bash

# Get script and project directories
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Check if servers are already running
FRONTEND_PID=""
BACKEND_PID=""

if [ -f /tmp/vite-dev.pid ]; then
  FRONTEND_PID=$(cat /tmp/vite-dev.pid)
  if ps -p $FRONTEND_PID > /dev/null 2>&1; then
    echo "⚠️  Frontend server is already running (PID: $FRONTEND_PID)"
    echo "   Stop it first with: pnpm stop"
    exit 1
  fi
fi

if [ -f /tmp/backend-dev.pid ]; then
  BACKEND_PID=$(cat /tmp/backend-dev.pid)
  if ps -p $BACKEND_PID > /dev/null 2>&1; then
    echo "⚠️  Backend server is already running (PID: $BACKEND_PID)"
    echo "   Stop it first with: pnpm stop"
    exit 1
  fi
fi

echo "🚀 Starting development servers..."

# Start database container if not running
echo "📦 Starting database..."
cd "$PROJECT_ROOT/.devcontainer"
docker compose up -d db 2>/dev/null
cd "$PROJECT_ROOT"

# Wait for database to be ready
sleep 2

# Start frontend
cd "$PROJECT_ROOT/packages/frontend"
nohup ./node_modules/.bin/vite --host --port 5173 > /tmp/vite-dev.log 2>&1 &
echo $! > /tmp/vite-dev.pid

# Start backend
cd "$PROJECT_ROOT/packages/backend"
nohup node src/server.js > /tmp/backend-dev.log 2>&1 &
echo $! > /tmp/backend-dev.pid

cd "$PROJECT_ROOT"

# Wait for servers to start
sleep 3

# Check if servers are responding
if curl -s http://localhost:5173 > /dev/null && curl -s http://localhost:3000/api/auth/demo-login -X POST > /dev/null; then
  echo "✅ Development servers started successfully!"
  echo ""
  echo "📱 Frontend: http://localhost:5173"
  echo "🔧 Backend:  http://localhost:3000"
  echo ""
  echo "📋 Logs:"
  echo "   Frontend: tail -f /tmp/vite-dev.log"
  echo "   Backend:  tail -f /tmp/backend-dev.log"
  echo ""
  echo "🛑 To stop: pnpm stop"
else
  echo "❌ Failed to start servers. Check logs:"
  echo "   Frontend: cat /tmp/vite-dev.log"
  echo "   Backend:  cat /tmp/backend-dev.log"
  exit 1
fi
