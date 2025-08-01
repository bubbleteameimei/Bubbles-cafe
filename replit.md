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