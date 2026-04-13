#!/bin/bash
# NyayMargadarshak Setup Script

echo ""
echo "⚖️  NyayMargadarshak — Setup Script"
echo "======================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d. -f1 | tr -d 'v')
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js 18+ required. Current: $(node -v)"
  exit 1
fi

echo "✅ Node.js $(node -v) found"

# Install root deps
echo ""
echo "📦 Installing root dependencies..."
npm install

# Install backend deps
echo ""
echo "📦 Installing backend dependencies..."
cd backend && npm install && cd ..

# Install frontend deps
echo ""
echo "📦 Installing frontend dependencies..."
cd frontend && npm install && cd ..

# Check Python (optional)
if command -v python3 &> /dev/null; then
  echo ""
  echo "✅ Python $(python3 --version) found"
  read -p "Install Python scraper dependencies? (y/N): " install_py
  if [[ $install_py == "y" || $install_py == "Y" ]]; then
    cd scraper && pip3 install -r requirements.txt && cd ..
    echo "✅ Python dependencies installed"
  fi
else
  echo ""
  echo "ℹ️  Python not found — scraper will use built-in Node.js scraper"
fi

# Create database directory
mkdir -p database

echo ""
echo "======================================"
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the platform:"
echo "   npm run dev"
echo ""
echo "🌐 URLs:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:5000"
echo ""
echo "📡 Python scraper (optional):"
echo "   cd scraper && python3 scraper.py"
echo ""
echo "⚠️  Remember to configure backend/.env with your settings"
echo "======================================"
