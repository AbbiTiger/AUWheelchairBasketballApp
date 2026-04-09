#!/bin/bash

# Quick reference for local development

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  COURTSIDE — AU Wheelchair Basketball Stats App"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Option A: Local Dev (recommended)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  1. Install API dependencies:"
echo "     cd api && npm install && cd .."
echo ""
echo "  2. Start the API server:"
echo "     cd api && npm start"
echo ""
echo "  3. In a new terminal, start the frontend:"
echo "     npm install && npm run dev"
echo ""
echo "  4. Seed test data:"
echo "     node scripts/seed.js"
echo ""
echo "  5. Open http://localhost:5173"
echo ""

echo "Option B: Docker"
echo "━━━━━━━━━━━━━━━━"
echo ""
echo "  docker compose up --build"
echo "  Open http://localhost"
echo ""
