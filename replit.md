# Interactive Storytelling Platform

## Overview
This project is an interactive storytelling platform providing a comprehensive environment for reading, writing, and sharing interactive stories. It includes user authentication, content management, and administrative features. The platform aims to offer a modern, engaging experience for users and content creators.

## User Preferences
Preferred communication style: Simple, everyday language.
GitHub repository: https://github.com/corpse777/interactive-storytelling-platform
Personal access token configured for Git authentication

## Recent Changes (August 2025)
- Removed all "Bubble's Cafe" and "blood drip cafe" references throughout the platform
- Enhanced Firebase authentication with Google sign-in integration
- Updated login page with modern glassmorphism UI design
- Implemented proper environment variable configuration for Firebase
- Enhanced password strength validation with visual indicators
- Updated README.md to reflect Interactive Storytelling Platform branding
- Cleaned up email templates to match new platform identity
- **LATEST**: Fixed critical TypeScript compilation errors that were preventing builds
- **LATEST**: Cleaned up broken imports and duplicate dependencies in server routes
- **LATEST**: Fixed search backend functionality by removing broken reported content references
- **LATEST**: Implemented proper NotificationSystem component with localStorage persistence
- **LATEST**: Enhanced GlobalLoadingOverlay with Framer Motion animations and real functionality
- **LATEST**: Improved ThemeProvider with smooth CSS transitions between light/dark modes
- **LATEST**: Application now builds successfully and serves correctly on port 3002
- **LATEST**: TypeScript compilation errors reduced to 1 minor warning (resolved with type casting)
- **LATEST**: Fixed critical JavaScript runtime error preventing React app from mounting (usePerformanceMonitoring reference)
- **LATEST**: Application successfully starts and runs on port 3002 with full functionality
- **LATEST**: All core systems operational: server, database, frontend, API endpoints, CSRF protection
- **LATEST**: Fixed DialogContent accessibility errors in navigation sidebar (added SheetTitle and SheetDescription)
- **LATEST**: Resolved all "DialogContent requires DialogTitle" warnings for screen reader compatibility
- **LATEST**: Fixed Google API script loading errors by consolidating duplicate Firebase configurations
- **LATEST**: Removed conflicting Firebase initialization in lib/firebase.ts, keeping single config in config/firebase.ts
- **LATEST**: Updated social authentication imports to use consolidated Firebase configuration

## System Architecture
The platform is built with a decoupled frontend and backend architecture.

**Frontend:**
- **Framework**: React 18 with TypeScript.
- **Build Tool**: Vite.
- **Styling**: Tailwind CSS, shadcn/ui, Radix UI.
- **State Management**: Zustand (global), React Query (server).
- **Routing**: Wouter.
- **UI/UX**: Responsive design, dark/light theme, font size controls, smooth scrolling, enhanced sidebar navigation with motion animations (Framer Motion), touch-friendly gestures, accessibility features (focus management, high contrast), visual depth with gradients and shadows.

**Backend:**
- **Framework**: Express.js with TypeScript.
- **Database**: PostgreSQL with Drizzle ORM.
- **Authentication**: Session-based, bcryptjs hashing.
- **Security**: CSRF protection, rate limiting, CORS, Helmet.
- **API Design**: RESTful JSON API.

**Database Schema:**
Includes tables for Users (authentication, profiles, roles), Posts (stories with categories, tags, metadata), Comments (threaded), Bookmarks, Categories & Tags, and Site Settings.

**Key Features:**
- **Content Management**: WordPress API integration for content sync, admin and community post submission, categorization, reading time calculation.
- **User Management**: Registration, authentication, profile management, role-based access control.
- **Reader Experience**: Responsive interface, theme support, progress tracking, bookmarking, interactive elements.
- **Administrative Features**: Consolidated admin menu (Dashboard, Content Management, User Management, Insights & Reports).

**Data Flow:**
- **Content Synchronization**: Primary sync from WordPress API every 5 minutes, with local storage and server-side API fallbacks.
- **Authentication Flow**: Session-based with secure cookies, CSRF protection, rate limiting, automatic session renewal.
- **API Request Flow**: Client requests include CSRF tokens, rate limiting applied, error handling with user feedback, automatic retry logic.

## External Dependencies
- **React Ecosystem**: React, React DOM, React Query.
- **UI Framework**: Radix UI, shadcn/ui, Tailwind CSS.
- **State Management**: Zustand, React Hook Form.
- **Database**: Drizzle ORM, PostgreSQL driver.
- **Authentication**: bcryptjs, express-session.
- **Security**: helmet, express-rate-limit, CORS.
- **Validation**: Zod.
- **Animations**: Framer Motion, React Confetti.
- **Typography**: React Simple Typewriter, React Scramble.
- **Icons**: Lucide React, React Icons.
- **Analytics**: PostHog.