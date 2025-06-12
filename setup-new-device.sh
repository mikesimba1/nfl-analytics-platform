#!/bin/bash

echo "🏈 NFL Analytics Platform - New Device Setup"
echo "==============================================="
echo ""

echo "📦 Installing Backend Dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Backend installation failed"
    exit 1
fi

echo ""
echo "🎨 Installing Frontend Dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Frontend installation failed"
    exit 1
fi

echo ""
echo "✅ Setup Complete!"
echo ""
echo "🚀 To start the platform:"
echo "  Backend:  cd backend && npm start"
echo "  Frontend: cd frontend && npm run dev"
echo ""
echo "📊 Enhanced Analytics Available at:"
echo "  http://localhost:3001/api/enhanced-analytics/model-performance"
echo "" 