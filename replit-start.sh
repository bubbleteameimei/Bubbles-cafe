#!/bin/bash

# Replit startup script for Bubbles Cafe
echo "🚀 Starting Bubbles Cafe development environment..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Set environment variables for Replit
export PORT=3002
export CLIENT_PORT=5173
export NODE_ENV=development

# Function to start server
start_server() {
    echo "🔧 Starting server on port $PORT..."
    cd server
    npm run dev &
    SERVER_PID=$!
    cd ..
    
    # Wait for server to be ready
    echo "⏳ Waiting for server to be ready..."
    for i in {1..30}; do
        if curl -s "http://localhost:$PORT/health" > /dev/null 2>&1; then
            echo "✅ Server is ready!"
            break
        fi
        if [ $i -eq 30 ]; then
            echo "❌ Server failed to start within 30 seconds"
            exit 1
        fi
        sleep 1
    done
}

# Function to start client
start_client() {
    echo "🎨 Starting client on port $CLIENT_PORT..."
    cd client
    npm run dev &
    CLIENT_PID=$!
    cd ..
    
    # Wait for client to be ready
    echo "⏳ Waiting for client to be ready..."
    for i in {1..30}; do
        if curl -s "http://localhost:$CLIENT_PORT" > /dev/null 2>&1; then
            echo "✅ Client is ready!"
            break
        fi
        if [ $i -eq 30 ]; then
            echo "❌ Client failed to start within 30 seconds"
            exit 1
        fi
        sleep 1
    done
}

# Function to monitor processes
monitor_processes() {
    echo "👀 Monitoring processes..."
    while true; do
        if ! kill -0 $SERVER_PID 2>/dev/null; then
            echo "❌ Server process died, restarting..."
            start_server
        fi
        
        if ! kill -0 $CLIENT_PID 2>/dev/null; then
            echo "❌ Client process died, restarting..."
            start_client
        fi
        
        sleep 10
    done
}

# Start both services
start_server
start_client

echo "🎉 Both services are running!"
echo "🌐 Server: http://localhost:$PORT"
echo "🎨 Client: http://localhost:$CLIENT_PORT"

# Monitor and restart if needed
monitor_processes