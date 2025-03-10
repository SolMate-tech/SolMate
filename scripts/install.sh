#!/bin/bash

# Display colored output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== SolMate Installation Script ===${NC}"

# Check if Node.js and npm are installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js not detected. Please install Node.js v16+ before running this script.${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm not detected. Please install npm v8+ before running this script.${NC}"
    exit 1
fi

# Display Node.js and npm versions
NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
echo -e "${BLUE}Detected Node.js version: ${NODE_VERSION}${NC}"
echo -e "${BLUE}Detected npm version: ${NPM_VERSION}${NC}"

# Create environment files
echo -e "${YELLOW}Creating environment files...${NC}"
if [ ! -f "./.env" ]; then
    cp ./.env.example ./.env
    echo -e "${GREEN}Root directory environment file created${NC}"
fi

if [ ! -f "./backend/.env" ]; then
    cp ./backend/.env.example ./backend/.env
    echo -e "${GREEN}Backend environment file created${NC}"
fi

if [ ! -f "./frontend/.env" ]; then
    cp ./frontend/.env.example ./frontend/.env
    echo -e "${GREEN}Frontend environment file created${NC}"
fi

# Install dependencies
echo -e "${BLUE}Installing project dependencies...${NC}"
npm install

# Install frontend and backend dependencies
echo -e "${BLUE}Installing frontend dependencies...${NC}"
cd frontend && npm install
cd ..

echo -e "${BLUE}Installing backend dependencies...${NC}"
cd backend && npm install
cd ..

echo -e "${GREEN}Installation complete! You can now run 'npm start' to start the project.${NC}" 