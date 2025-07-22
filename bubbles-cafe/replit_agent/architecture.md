# Architecture Overview

## 1. Overview

This document outlines the architecture of "Bubble's Cafe," a horror-themed blog platform that allows users to read and engage with horror stories. The application is built as a full-stack JavaScript/TypeScript application with a React frontend and Node.js backend.

### 1.1 Key Features

- User authentication and authorization
- Content management (stories/posts)
- User interactions (comments, likes, bookmarks)
- Theme customization and font size controls
- Dark/light mode support
- Mobile-responsive design
- Performance optimizations (image optimization, lazy loading)

## 2. System Architecture

The application follows a modern client-server architecture with clear separation of concerns:

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  React Client   ├──────┤  Express Server ├──────┤  PostgreSQL DB  │
│  (SPA)          │      │  (API)          │      │  (Data Storage) │
│                 │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

### 2.1 Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS, Radix UI components, Framer Motion
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based auth with Passport.js, OAuth integrations
- **State Management**: React Query for server state, local React state
- **Build Tools**: Vite, ESBuild, PostCSS
- **Deployment**: Cloud Run (per Replit configuration)

## 3. Key Components

### 3.1 Frontend Architecture

The frontend is built as a Single Page Application (SPA) using React and follows a component-based architecture with Tailwind CSS for styling.

#### 3.1.1 Directory Structure

- `/client/src/`
  - `/components/` - Reusable UI components
  - `/hooks/` - Custom React hooks for shared logic
  - `/pages/` - Page components for each route
  - `/services/` - API service functions
  - `/styles/` - Global CSS and style utilities
  - `/utils/` - Utility functions
  - `/lib/` - Shared libraries and configurations

#### 3.1.2 UI Component System

The application uses a component library built on Radix UI primitives and shadcn/ui, providing accessible and customizable UI components. Key components include:

- Navigation components (navbar, sidebar)
- Reader interface with font size controls
- Toast notification system
- Form components with validation
- Modal and dialog components

### 3.2 Backend Architecture

The backend is an Express.js application structured with modular routes and middleware patterns.

#### 3.2.1 Directory Structure

- `/server/`
  - `index.ts` - Server entry point
  - `auth.ts` - Authentication logic
  - `db.ts` - Database connection
  - `routes.ts` - API route definitions
  - `storage.ts` - Data access layer
  - `/middleware/` - Express middleware
  - `/routes/` - Route handlers organized by domain
  - `/utils/` - Utility functions

#### 3.2.2 API Structure

The API follows RESTful conventions with route handlers organized by domain:

- `/api/posts` - Story/post management
- `/api/comments` - Comment functionality
- `/api/auth` - Authentication endpoints
- `/api/admin` - Admin-specific functions
- `/api/moderation` - Content moderation

### 3.3 Data Layer

#### 3.3.1 Database Schema

The application uses PostgreSQL with Drizzle ORM for type-safe database operations. Key tables include:

- `users` - User accounts and profiles
- `posts` - Horror stories/blog posts
- `comments` - User comments on posts
- `activity_logs` - User activity tracking
- `author_stats` - Statistics for post authors
- `bookmarks` - User bookmarks for posts

The schema is defined in `/shared/schema.ts` with Drizzle ORM schema definitions.

#### 3.3.2 Data Access Pattern

The application uses a repository pattern through the `storage.ts` module, which provides a unified interface for data operations, abstracting the underlying Drizzle ORM implementation.

## 4. Data Flow

### 4.1 Client-Server Communication

1. React components use custom hooks to fetch data through React Query
2. API requests are made to the Express backend endpoints
3. The server processes requests through middleware (auth, validation, etc.)
4. Data is retrieved or modified through the storage layer
5. Responses are returned to the client and cached appropriately

### 4.2 Authentication Flow

1. Users authenticate via email/password or OAuth providers
2. Passport.js manages authentication strategies
3. Sessions are stored server-side with client cookies for session identification
4. Protected routes check authentication status via middleware
5. User data is attached to requests for authorized operations

## 5. External Dependencies

### 5.1 Firebase Integration

The application integrates with Firebase for additional services, as evidenced by Firebase configuration in environment files:

- Authentication (potentially used as an alternative auth provider)
- Storage for media files
- Analytics for user behavior tracking

### 5.2 WordPress Content Sync

The application includes scripts for syncing content from WordPress:

- `wordpress-api-sync.ts` - Fetches and transforms WordPress posts
- `sync-scheduler.ts` - Schedules regular content syncing
- Content is sanitized and adapted to the application's schema

### 5.3 Other External Services

- SendGrid for email communications
- Anthropic AI SDK for potential AI-powered features

## 6. Deployment Strategy

### 6.1 Environment Configuration

The application uses environment-specific configuration with dedicated files:

- `.env.development` - Development settings
- `.env.production` - Production settings
- `.env.local` - Local overrides (not committed to version control)

Configuration is managed through a centralized config module in `/shared/config/`.

### 6.2 Build Process

1. Frontend is built using Vite
2. Backend is bundled with ESBuild
3. Static assets are optimized and included in the build

### 6.3 Deployment Platform

The application is configured for deployment on Replit's Cloud Run service:

```
[deployment]
deploymentTarget = "cloudrun"
build = ["sh", "-c", "npm run build"]
run = ["sh", "-c", "npm start"]
```

### 6.4 Database Management

Database migrations are managed through Drizzle Kit:

- `drizzle.config.ts` - Migration configuration
- `/migrations/` - SQL migration files
- Scripts for database initialization and seeding

## 7. Performance Optimizations

### 7.1 Frontend Optimizations

- Code splitting via React.lazy and Suspense
- Image optimization for different network conditions
- Font size controls for accessibility
- Service worker for caching and offline support

### 7.2 Backend Optimizations

- Connection pooling for database efficiency
- Caching strategies for frequently accessed data
- Rate limiting to prevent abuse
- Compression of responses

## 8. Security Considerations

- CSRF protection through appropriate headers
- Content moderation for user-generated content
- Input validation with zod schemas
- Secure session management
- Environment-specific security configurations

## 9. Future Architectural Considerations

Based on the codebase, potential areas for architectural evolution include:

- Enhanced PWA capabilities for better offline experience
- Serverless function architecture for specific features
- Improved analytics and monitoring infrastructure
- More granular permission system for content access