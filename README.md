# Bubbles Cafe Monorepo

<!-- Deployment timestamp: 2025-08-10 12:30:00 UTC - Force fresh deployment with latest fixes -->

A monorepo containing the Bubbles Cafe application with client, server, and shared packages.

## Structure

- `client/` - React frontend application
- `server/` - Node.js backend API
- `shared/` - Shared types and utilities

## Development

```bash
npm install
npm run dev
```

## Building

```bash
npm run build
```

## Deployment

The application is configured for deployment on:
- **Frontend**: Vercel
- **Backend**: Render

## Recent Fixes

- ✅ Fixed Docker build issues (vite not found, shared/dist missing)
- ✅ Fixed server startup crashes (WordPress sync conditional)
- ✅ Fixed Vercel header configuration errors
- ✅ Made database-dependent services conditional on database availability