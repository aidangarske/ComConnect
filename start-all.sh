#!/bin/bash

# ComConnect - Full Stack Startup Script with MongoDB Setup

echo "╔════════════════════════════════════════════════════════════╗"
echo "║           ComConnect - Full Stack Startup                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Get the directory where this script is located
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if .env exists
ENV_FILE="$SCRIPT_DIR/server/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️  MongoDB not configured yet!${NC}"
    echo ""
    echo -e "${BLUE}Running MongoDB Atlas setup...${NC}"
    echo ""
    bash "$SCRIPT_DIR/setup-mongodb.sh"
    
    if [ ! -f "$ENV_FILE" ]; then
        echo -e "${RED}❌ MongoDB setup failed. Please try again.${NC}"
        exit 1
    fi
fi

# Setup frontend environment for local development
FRONTEND_ENV_FILE="$SCRIPT_DIR/client/mern-stack/frontend/.env.local"
echo -e "${BLUE}Setting up local environment variables...${NC}"
cat > "$FRONTEND_ENV_FILE" << 'EOF'
# Local Development Environment Variables
# These override production settings from Render
VITE_API_URL=http://localhost:8080/api
VITE_SOCKET_URL=http://localhost:8080
EOF

# Ensure backend has FRONTEND_URL set for local CORS
if [ -f "$ENV_FILE" ]; then
    if ! grep -q "FRONTEND_URL" "$ENV_FILE"; then
        echo "" >> "$ENV_FILE"
        echo "# Local Development - Frontend URL for CORS" >> "$ENV_FILE"
        echo "FRONTEND_URL=http://localhost:5173" >> "$ENV_FILE"
    fi
fi

echo -e "${GREEN}✅ Local environment configured${NC}"
echo ""

# Kill any existing processes on ports 5173, 5174, 5175, 8080
echo -e "${BLUE}Cleaning up old processes...${NC}"
pkill -f "npm run dev" 2>/dev/null
pkill -f "nodemon" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 2

echo -e "${GREEN}✅ Ready to start servers${NC}"
echo ""

# Start Backend
echo -e "${YELLOW}Starting Backend (Node.js/Express)...${NC}"
cd "$SCRIPT_DIR/server"
npm run dev > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
sleep 3

# Start Frontend
echo -e "${YELLOW}Starting Frontend (React/Vite)...${NC}"
cd "$SCRIPT_DIR/client/mern-stack/frontend"
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"
sleep 3

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║              🚀 SERVERS RUNNING 🚀                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check backend status
if curl -s http://localhost:8080/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}Backend:${NC}   http://localhost:8080 ✅"
else
    echo -e "${RED}Backend:${NC}   http://localhost:8080 ❌ (check /tmp/backend.log)"
fi

# Find frontend port
FRONTEND_PORT=$(netstat -tlnp 2>/dev/null | grep node | grep -oP ':\K\d+' | grep -E "517[3-9]|518[0-9]" | head -1)
if [ -z "$FRONTEND_PORT" ]; then
    FRONTEND_PORT=5173
fi

echo -e "${GREEN}Frontend:${NC}  http://localhost:$FRONTEND_PORT ✅"
echo ""

echo -e "${BLUE}Backend PID:${NC}  $BACKEND_PID"
echo -e "${BLUE}Frontend PID:${NC} $FRONTEND_PID"
echo ""

echo -e "${BLUE}📂 Log files:${NC}"
echo "  Backend:  /tmp/backend.log"
echo "  Frontend: /tmp/frontend.log"
echo ""

echo -e "${GREEN}Opening browser...${NC}"
if command -v xdg-open > /dev/null; then
    xdg-open "http://localhost:$FRONTEND_PORT" 2>/dev/null &
elif command -v open > /dev/null; then
    open "http://localhost:$FRONTEND_PORT" 2>/dev/null &
fi

echo ""
echo -e "${BLUE}🎉 ComConnect is ready!${NC}"
echo ""
echo -e "${YELLOW}To stop servers:${NC}"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo -e "${YELLOW}To view logs:${NC}"
echo "  tail -f /tmp/backend.log"
echo "  tail -f /tmp/frontend.log"
echo ""

# Keep script running
wait
