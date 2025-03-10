#!/bin/bash

# Display colored output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== SolMate Startup Script ===${NC}"
echo -e "${BLUE}Starting SolMate services...${NC}"

# Check environment files
if [ ! -f "./backend/.env" ]; then
  echo -e "${YELLOW}Backend environment file does not exist, creating from example...${NC}"
  cp ./backend/.env.example ./backend/.env
  echo -e "${GREEN}Please edit ./backend/.env file to configure your environment${NC}"
fi

if [ ! -f "./frontend/.env" ]; then
  echo -e "${YELLOW}Frontend environment file does not exist, creating from example...${NC}"
  cp ./frontend/.env.example ./frontend/.env
  echo -e "${GREEN}Please edit ./frontend/.env file to configure your environment${NC}"
fi

# Install dependencies
echo -e "${BLUE}Installing project dependencies...${NC}"
npm install

# Start services
echo -e "${GREEN}Starting services...${NC}"
npm start 