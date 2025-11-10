#!/bin/bash

# Get script and project directories
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Check if frontend server is already running
if [ -f /tmp/vite-dev.pid ]; then
  FRONTEND_PID=$(cat /tmp/vite-dev.pid)
  if ps -p $FRONTEND_PID > /dev/null 2>&1; then
    echo "⚠️  Frontend server is already running (PID: $FRONTEND_PID)"
    echo "   Stop it first with: pnpm stop"
    exit 1
  fi
fi

echo "🚀 Starting development servers..."

# Check if Supabase is running
if ! supabase status > /dev/null 2>&1; then
  echo "⚠️  Supabase is not running. Starting Supabase..."
  echo "   This may take a minute..."
  supabase start
else
  echo "✅ Supabase is already running"
fi

# Start frontend
cd "$PROJECT_ROOT"
nohup ./node_modules/.bin/vite --config config/vite.config.ts --host --port 5173 > /tmp/vite-dev.log 2>&1 &
echo $! > /tmp/vite-dev.pid

# Wait for frontend to start
sleep 3

# Check if frontend is responding
if curl -s http://localhost:5173 > /dev/null; then
  echo "✅ Development server started successfully!"
  echo ""
  echo "📱 Frontend: http://localhost:5173"
  echo "🗄️  Supabase Studio: http://localhost:54323"
  echo ""
  echo "📋 Logs:"
  echo "   Frontend: tail -f /tmp/vite-dev.log"
  echo ""
  echo "🛑 To stop: pnpm stop"
else
  echo "❌ Failed to start frontend. Check logs:"
  echo "   Frontend: cat /tmp/vite-dev.log"
  exit 1
fi
