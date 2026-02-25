#!/bin/bash
# Admin setup: Create mortadagzar@gmail.com with password 123456
# Run after: npx ampx sandbox (or deploy) to get USER_POOL_ID
# Requires: AWS CLI, jq
#
# Usage:
#   export USER_POOL_ID=us-east-1_xxxxx   # From Amplify outputs
#   ./scripts/admin-setup.sh

set -e

EMAIL="mortadagzar@gmail.com"
PASSWORD="123456"  # Cognito min is 6 chars

if [ -z "$USER_POOL_ID" ]; then
  echo "Error: Set USER_POOL_ID (from Amplify outputs or AWS Console)"
  echo "  npx ampx sandbox --outputs-out-dir ./amplify_outputs"
  echo "  Then check amplify_outputs/amplify_outputs.json for auth.userPoolId"
  exit 1
fi

echo "Creating admin user: $EMAIL"
aws cognito-idp admin-create-user \
  --user-pool-id "$USER_POOL_ID" \
  --username "$EMAIL" \
  --user-attributes Name=email,Value="$EMAIL" Name=email_verified,Value=true Name=name,Value="Admin" \
  --message-action SUPPRESS \
  --temporary-password "$PASSWORD" 2>/dev/null || true

echo "Setting permanent password..."
aws cognito-idp admin-set-user-password \
  --user-pool-id "$USER_POOL_ID" \
  --username "$EMAIL" \
  --password "$PASSWORD" \
  --permanent

echo "Done. Admin: $EMAIL / $PASSWORD"
echo "Sign in at: https://toolstoy.app/signin then go to /admin"
