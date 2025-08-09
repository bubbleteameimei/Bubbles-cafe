# 🚀 Bubbles Cafe - Replit Setup Guide

## **Quick Start in Replit**

### **Option 1: Simple Start (Recommended)**
```bash
npm run replit:simple
```

### **Option 2: Manual Start**
```bash
# Terminal 1 - Start Server
npm run -w server dev

# Terminal 2 - Start Client  
npm run -w client dev
```

### **Option 3: Custom Startup Script**
```bash
bash replit-start.sh
```

## **Port Configuration**
- **Server**: Port 3002 (API endpoints)
- **Client**: Port 5173 (Frontend)
- **Database**: PostgreSQL (configured via environment variables)

## **Environment Variables**
Make sure these are set in Replit's Secrets:
- `DATABASE_URL` - Your PostgreSQL connection string
- `SESSION_SECRET` - A secure random string (32+ characters)
- `NODE_ENV` - Set to "development"

## **Troubleshooting**

### **If servers keep stopping:**
1. Check the console for error messages
2. Verify environment variables are set
3. Try the simple start command: `npm run replit:simple`
4. Check if ports are available

### **If database connection fails:**
1. Verify `DATABASE_URL` is correct
2. Check if PostgreSQL service is running
3. Ensure database is accessible from Replit

### **If frontend won't load:**
1. Check if client is running on port 5173
2. Verify server is running on port 3002
3. Check browser console for errors

## **Development Commands**
```bash
# Type checking
npm run typecheck

# Build for production
npm run build

# Install dependencies
npm install

# Run tests
npm run test
```

## **File Structure**
```
├── client/          # React frontend (Vite)
├── server/          # Express backend
├── shared/          # Shared types and schemas
├── .replit          # Replit configuration
├── replit-start.sh  # Custom startup script
└── package.json     # Root package configuration
```

## **Accessing Your App**
- **Frontend**: https://your-repl-name.your-username.repl.co
- **API**: https://your-repl-name.your-username.repl.co/api
- **Health Check**: https://your-repl-name.your-username.repl.co/health

## **Keep Alive Features**
- Server sends heartbeat every 30 seconds
- Automatic process monitoring and restart
- Graceful shutdown handling
- Health check endpoint for monitoring

## **Need Help?**
If you're still having issues:
1. Check the console logs for specific error messages
2. Try restarting the Replit workspace
3. Verify all dependencies are installed
4. Check if the ports are properly configured in .replit