# Deployment Guide

## Quick Deploy

### Prerequisites
- GitHub account
- Vercel account (for frontend)
- Render account (for backend)
- Neon account (for database)

### 1. Database Setup (Neon)
1. Create a Neon account at https://neon.tech
2. Create a new project
3. Copy the connection string
4. Set as `DATABASE_URL` environment variable

### 2. Backend Deployment (Render)
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `npm install && npm run build`
4. Set start command: `npm run start`
5. Add environment variables:
   - `DATABASE_URL`: Your Neon connection string
   - `NODE_ENV`: production
   - `GMAIL_USER`: Your Gmail address (for email service)
   - `GMAIL_APP_PASSWORD`: Your Gmail app password

### 3. Frontend Deployment (Vercel)
1. Connect your GitHub repository to Vercel
2. Set framework preset to "Vite"
3. Set build command: `cd client && npm run build`
4. Set output directory: `client/dist`
5. Add environment variables:
   - `VITE_API_URL`: Your Render backend URL

### 4. Environment Variables Summary

#### Backend (Render)
```bash
DATABASE_URL=postgresql://...
NODE_ENV=production
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
PORT=3003
```

#### Frontend (Vercel)
```bash
VITE_API_URL=https://your-backend.render.com
```

### 5. Post-Deployment Setup
1. Access your backend URL to trigger database initialization
2. Login with admin credentials: admin / admin123
3. Change default admin password
4. Test WordPress sync functionality
5. Verify cross-domain authentication

## Local Development

### Setup
```bash
npm install
npm run dev
```

### Database Operations
```bash
# Push schema changes
npm run db:push

# Open database studio
npm run db:studio
```

## Troubleshooting

### Common Issues
1. **CORS errors**: Ensure backend URL is correctly set in frontend env
2. **Database connection**: Verify DATABASE_URL format and credentials
3. **Authentication issues**: Check cookie settings for cross-domain setup
4. **WordPress sync**: Verify WordPress API accessibility

### Support
For deployment issues, check the logs in your hosting platform's dashboard.