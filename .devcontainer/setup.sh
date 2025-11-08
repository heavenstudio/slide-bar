#!/bin/bash
set -e

echo "🚀 Setting up Slide Bar development environment..."

# Navigate to workspace
cd /workspace/slide-bar

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
cd packages/backend
pnpm prisma generate

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until pg_isready -h localhost -p 5432 -U slidebar_user; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done

# Run migrations
echo "🗄️  Running database migrations..."
pnpm prisma migrate dev --name init

echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Run 'pnpm dev' to start both servers"
echo "  2. Frontend: http://localhost:5173"
echo "  3. Backend: http://localhost:3000"
echo ""
