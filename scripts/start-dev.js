#!/usr/bin/env node

/**
 * NFL Analytics Pro - Development Startup Script
 * Starts both frontend and backend in development mode
 */

const { spawn } = require('child_process')
const path = require('path')

console.log('🏈 Starting NFL Analytics Pro Development Environment...\n')

// Start backend server
console.log('🔧 Starting Backend API Server...')
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, '../backend'),
  stdio: 'inherit',
  shell: true
})

// Wait a moment for backend to start
setTimeout(() => {
  console.log('\n📱 Starting Frontend React App...')
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, '../frontend'),
    stdio: 'inherit',
    shell: true
  })

  frontend.on('error', (error) => {
    console.error('❌ Frontend error:', error)
  })
}, 3000)

backend.on('error', (error) => {
  console.error('❌ Backend error:', error)
})

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down NFL Analytics Pro...')
  backend.kill()
  process.exit(0)
})

console.log('\n✅ Development environment starting...')
console.log('📊 Backend API: http://localhost:3001')
console.log('🌐 Frontend App: http://localhost:3000')
console.log('\nPress Ctrl+C to stop both servers') 