#!/bin/bash

# Setup test database for unit tests
# Ensures demo user exists in test instance (port 55321)

echo "🔧 Setting up test database..."

# Create demo user in test instance
SUPABASE_URL="http://127.0.0.1:55321" ./scripts/create-demo-user.sh

echo "✅ Test database ready"
