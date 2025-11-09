#!/bin/bash

echo "🛑 Stopping development servers..."

STOPPED=0

# Stop frontend
if [ -f /tmp/vite-dev.pid ]; then
  FRONTEND_PID=$(cat /tmp/vite-dev.pid)
  if ps -p $FRONTEND_PID > /dev/null 2>&1; then
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Frontend server stopped (PID: $FRONTEND_PID)"
    STOPPED=1
  fi
  rm -f /tmp/vite-dev.pid
fi

# Clean up log file
rm -f /tmp/vite-dev.log

if [ $STOPPED -eq 0 ]; then
  echo "ℹ️  No development servers were running"
else
  echo "✅ Development server stopped"
  echo ""
  echo "ℹ️  Supabase is still running. To stop it, run:"
  echo "   supabase stop"
fi
