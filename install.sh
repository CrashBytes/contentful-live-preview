#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Setting up Contentful Live Preview...${NC}"

# Check if .env.local already exists
if [ -f .env.local ]; then
  echo -e "${YELLOW}Warning: .env.local already exists. Creating backup...${NC}"
  cp .env.local .env.local.backup
  echo -e "${GREEN}Backup created at .env.local.backup${NC}"
fi

# Create .env.local file with default values
echo -e "${BLUE}Creating .env.local file with default values...${NC}"

cat > .env.local << EOL
# Contentful API credentials
# Replace these values with your actual Contentful credentials
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_DELIVERY_TOKEN=your_delivery_token
CONTENTFUL_PREVIEW_TOKEN=your_preview_token
CONTENTFUL_PREVIEW_SECRET=your_preview_secret
CONTENTFUL_ENVIRONMENT=master

# Public environment variables that will be exposed to the browser
NEXT_PUBLIC_CONTENTFUL_SPACE_ID=your_space_id
NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT=master
EOL

echo -e "${GREEN}Created .env.local file successfully!${NC}"
echo -e "${YELLOW}IMPORTANT: Edit the .env.local file and replace the default values with your actual Contentful credentials.${NC}"

# Setup instructions
echo -e "${BLUE}Next steps:${NC}"
echo -e "1. Edit .env.local with your Contentful credentials"
echo -e "2. Run ${YELLOW}yarn install${NC} to install dependencies"
echo -e "3. Run ${YELLOW}yarn dev${NC} to start the development server"

# Make the script executable
chmod +x install.sh

echo -e "${GREEN}Setup complete!${NC}"