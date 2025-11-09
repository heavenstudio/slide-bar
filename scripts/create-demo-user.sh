#!/bin/bash

# Create demo user using Supabase Admin API
# This ensures the password is properly hashed by Supabase GoTrue

# Use the default Supabase local development service_role JWT
# This is a well-known value for local development only
SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU}"
SUPABASE_URL="${SUPABASE_URL:-http://127.0.0.1:54321}"

echo "🔐 Creating demo user with Supabase Admin API..."

# Create user using Admin API and capture the user ID
USER_RESPONSE=$(curl -X POST "${SUPABASE_URL}/auth/v1/admin/users" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "demo-password-123",
    "email_confirm": true,
    "user_metadata": {
      "name": "Demo User",
      "organization_id": "00000000-0000-0000-0000-000000000001"
    }
  }' 2>/dev/null)

if echo "$USER_RESPONSE" | grep -q '"id"'; then
  echo "✅ Demo auth user created successfully"
  # Extract user ID from response (basic parsing, works for local dev)
  USER_ID=$(echo "$USER_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
elif echo "$USER_RESPONSE" | grep -q '"email_exists"'; then
  echo "⚠️  Auth user already exists, fetching existing user ID..."
  # Get existing user by email
  USER_RESPONSE=$(curl -s "${SUPABASE_URL}/auth/v1/admin/users?email=demo@example.com" \
    -H "apikey: $SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SERVICE_ROLE_KEY" 2>/dev/null)
  USER_ID=$(echo "$USER_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
else
  echo "❌ Failed to create or fetch user"
  exit 1
fi

# Create corresponding public.users record (idempotent)
echo "📝 Creating public.users record..."
curl -X POST "${SUPABASE_URL}/rest/v1/users" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d "{
    \"id\": \"$USER_ID\",
    \"email\": \"demo@example.com\",
    \"password\": \"hashed\",
    \"name\": \"Demo User\",
    \"organization_id\": \"00000000-0000-0000-0000-000000000001\"
  }" 2>/dev/null && echo "✅ Public user record created" || echo "⚠️  Public user may already exist"

echo "✅ Demo user setup complete"
