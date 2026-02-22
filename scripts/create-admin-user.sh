#!/bin/bash

# Create Admin User Script for Toolstoy
# This script creates an admin user in Cognito and confirms their email

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Toolstoy Admin User Creator ===${NC}\n"

# Get User Pool ID from amplify_outputs.json
USER_POOL_ID=$(jq -r '.auth.user_pool_id' amplify_outputs.json 2>/dev/null)

if [ -z "$USER_POOL_ID" ] || [ "$USER_POOL_ID" = "null" ]; then
  echo -e "${RED}Error: Could not find User Pool ID in amplify_outputs.json${NC}"
  echo "Make sure you've deployed your Amplify backend first."
  exit 1
fi

echo -e "User Pool ID: ${GREEN}$USER_POOL_ID${NC}\n"

# Admin emails
ADMIN_EMAIL_1="mortadagzar@gmail.com"
ADMIN_EMAIL_2="mortada@howvie.com"

# Password (change this!)
TEMP_PASSWORD="Admin123!"

echo -e "${YELLOW}Creating admin users...${NC}\n"

# Function to create user
create_user() {
  local email=$1
  local name=$2
  
  echo -e "Creating user: ${GREEN}$email${NC}"
  
  # Create user
  aws cognito-idp admin-create-user \
    --user-pool-id "$USER_POOL_ID" \
    --username "$email" \
    --user-attributes \
      Name=email,Value="$email" \
      Name=email_verified,Value=true \
      Name=name,Value="$name" \
    --temporary-password "$TEMP_PASSWORD" \
    --message-action SUPPRESS \
    2>/dev/null
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ User created${NC}"
    
    # Set permanent password
    aws cognito-idp admin-set-user-password \
      --user-pool-id "$USER_POOL_ID" \
      --username "$email" \
      --password "$TEMP_PASSWORD" \
      --permanent \
      2>/dev/null
    
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}✓ Password set to permanent${NC}"
      echo -e "${GREEN}✓ Email verified${NC}\n"
      return 0
    else
      echo -e "${RED}✗ Failed to set permanent password${NC}\n"
      return 1
    fi
  else
    echo -e "${YELLOW}⚠ User might already exist${NC}"
    
    # Try to reset password for existing user
    echo -e "Attempting to reset password..."
    aws cognito-idp admin-set-user-password \
      --user-pool-id "$USER_POOL_ID" \
      --username "$email" \
      --password "$TEMP_PASSWORD" \
      --permanent \
      2>/dev/null
    
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}✓ Password reset successful${NC}\n"
      return 0
    else
      echo -e "${RED}✗ Failed to reset password${NC}\n"
      return 1
    fi
  fi
}

# Create both admin users
create_user "$ADMIN_EMAIL_1" "Mortada Gzar"
create_user "$ADMIN_EMAIL_2" "Mortada Howvie"

echo -e "${GREEN}=== Setup Complete ===${NC}\n"
echo -e "You can now sign in with:"
echo -e "  Email: ${GREEN}$ADMIN_EMAIL_1${NC} or ${GREEN}$ADMIN_EMAIL_2${NC}"
echo -e "  Password: ${GREEN}$TEMP_PASSWORD${NC}"
echo -e "\n${YELLOW}IMPORTANT: Change this password after first login!${NC}\n"
