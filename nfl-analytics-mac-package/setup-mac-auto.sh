#!/bin/bash

# 🍎 NFL Analytics Platform - Automated Mac Setup
# This script handles EVERYTHING automatically - no user input required

set -e  # Exit on any error

echo "🍎 NFL Analytics Platform - Automated Mac Setup"
echo "================================================"
echo "Setting up your NFL analytics project on Mac..."
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install Homebrew if needed
install_homebrew() {
    if ! command_exists brew; then
        echo "📦 Installing Homebrew (Mac package manager)..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" || {
            echo "❌ Failed to install Homebrew"
            exit 1
        }
        
        # Add Homebrew to PATH for this session
        if [[ -f "/opt/homebrew/bin/brew" ]]; then
            eval "$(/opt/homebrew/bin/brew shellenv)"
        elif [[ -f "/usr/local/bin/brew" ]]; then
            eval "$(/usr/local/bin/brew shellenv)"
        fi
    else
        echo "✅ Homebrew already installed"
    fi
}

# Function to install Node.js if needed
install_nodejs() {
    if ! command_exists node; then
        echo "📦 Installing Node.js..."
        brew install node || {
            echo "❌ Failed to install Node.js"
            exit 1
        }
    else
        echo "✅ Node.js already installed ($(node --version))"
    fi
}

# Function to install Git if needed
install_git() {
    if ! command_exists git; then
        echo "📦 Installing Git..."
        brew install git || {
            echo "❌ Failed to install Git"
            exit 1
        }
    else
        echo "✅ Git already installed ($(git --version))"
    fi
}

# Function to setup project dependencies
setup_project() {
    echo ""
    echo "🔧 Setting up project dependencies..."
    
    # Backend setup
    if [[ -d "backend" ]]; then
        echo "📦 Installing backend dependencies..."
        cd backend
        npm install --silent || {
            echo "❌ Backend dependency installation failed"
            exit 1
        }
        cd ..
        echo "✅ Backend dependencies installed"
    else
        echo "⚠️  Backend directory not found, skipping..."
    fi
    
    # Frontend setup
    if [[ -d "frontend" ]]; then
        echo "🎨 Installing frontend dependencies..."
        cd frontend
        npm install --silent || {
            echo "❌ Frontend dependency installation failed"
            exit 1
        }
        cd ..
        echo "✅ Frontend dependencies installed"
    else
        echo "⚠️  Frontend directory not found, skipping..."
    fi
}

# Function to create Mac-specific launch scripts
create_launch_scripts() {
    echo ""
    echo "🚀 Creating Mac launch scripts..."
    
    # Backend launcher
    cat > start-backend-mac.sh << 'EOF'
#!/bin/bash
echo "🏈 Starting NFL Analytics Backend..."
cd backend
npm start
EOF
    chmod +x start-backend-mac.sh
    
    # Frontend launcher  
    cat > start-frontend-mac.sh << 'EOF'
#!/bin/bash
echo "🎨 Starting NFL Analytics Frontend..."
cd frontend
npm run dev
EOF
    chmod +x start-frontend-mac.sh
    
    # Combined launcher
    cat > start-nfl-analytics-mac.sh << 'EOF'
#!/bin/bash
echo "🏈 Starting NFL Analytics Platform on Mac..."
echo "Backend will start on http://localhost:3001"
echo "Frontend will start on http://localhost:3000"
echo ""

# Start backend in background
echo "Starting backend..."
cd backend && npm start &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend in foreground
echo "Starting frontend..."
cd ../frontend && npm run dev

# Cleanup on exit
trap "kill $BACKEND_PID 2>/dev/null" EXIT
EOF
    chmod +x start-nfl-analytics-mac.sh
    
    echo "✅ Launch scripts created"
}

# Function to create environment file template
create_env_template() {
    if [[ -d "backend" && ! -f "backend/.env" ]]; then
        echo ""
        echo "⚙️  Creating environment configuration..."
        cat > backend/.env << 'EOF'
# NFL Analytics Environment Configuration
DEVELOPMENT_MODE=true
PORT=3001
ODDS_API_KEY=your_api_key_here

# Optional: Add your real API key for live data
# Get free key from: https://the-odds-api.com/
# ODDS_API_KEY=your_real_api_key_here
EOF
        echo "✅ Environment file created at backend/.env"
    fi
}

# Function to test the setup
test_setup() {
    echo ""
    echo "🧪 Testing setup..."
    
    if [[ -d "backend" ]]; then
        cd backend
        if node -e "console.log('Node.js test passed')" 2>/dev/null; then
            echo "✅ Backend Node.js test passed"
        else
            echo "❌ Backend Node.js test failed"
        fi
        cd ..
    fi
    
    if [[ -d "frontend" ]]; then
        cd frontend
        if node -e "console.log('Node.js test passed')" 2>/dev/null; then
            echo "✅ Frontend Node.js test passed"
        else
            echo "❌ Frontend Node.js test failed"
        fi
        cd ..
    fi
}

# Main execution
main() {
    echo "🔍 Checking system requirements..."
    
    # Install required tools
    install_homebrew
    install_nodejs
    install_git
    
    echo ""
    echo "✅ All system requirements met!"
    
    # Setup project
    setup_project
    create_launch_scripts
    create_env_template
    test_setup
    
    echo ""
    echo "🎉 Setup Complete! Your NFL Analytics Platform is ready on Mac!"
    echo ""
    echo "🚀 To start the platform:"
    echo "   Option 1 (Recommended): ./start-nfl-analytics-mac.sh"
    echo "   Option 2 (Separate):    ./start-backend-mac.sh && ./start-frontend-mac.sh"
    echo ""
    echo "📊 Enhanced Analytics will be available at:"
    echo "   Backend:  http://localhost:3001/api/enhanced-analytics/model-performance"
    echo "   Frontend: http://localhost:3000"
    echo ""
    echo "🔧 System Info:"
    echo "   Node.js: $(node --version)"
    echo "   npm: $(npm --version)"
    echo "   Platform: macOS $(sw_vers -productVersion 2>/dev/null || echo 'Unknown')"
    echo ""
    echo "✅ Everything is ready! Run ./start-nfl-analytics-mac.sh to begin!"
}

# Run main function
main 