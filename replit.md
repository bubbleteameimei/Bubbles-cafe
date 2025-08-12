# Interactive Storytelling Platform

## Overview
This project is an interactive storytelling platform built with a modern web stack (React, TypeScript, Express.js, PostgreSQL). Its main purpose is to provide a comprehensive environment for users to read, write, and share interactive stories. Key capabilities include robust user authentication, efficient content management, and administrative functionalities. The business vision is to create a leading platform for engaging, user-driven narratives, tapping into the growing market for interactive digital content.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes
- **August 12, 2025**: Simplified sidebar animations and enhanced icon animations
  - Removed complex Framer Motion top-level animations from sidebar for improved performance
  - Replaced motion.div with regular div and removed staggered children animations
  - Kept UI layout and styling intact while simplifying animation complexity
  - Book icons in browse stories made slightly smaller (h-5 w-5 → h-4 w-4) with improved multi-stage animation (rotation + scale)
  - Arrow icons on start reading buttons made slightly larger (h-5 w-5 → h-6 w-6)  
  - Enhanced book icon animations with smoother rotation and scale effects
  - Updated both home page and stories index page for consistency

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, shadcn/ui, Radix UI
- **State Management**: Zustand (global), React Query (server)
- **Routing**: Wouter
- **UI/UX Decisions**: Custom components built on Radix UI focusing on accessibility; Dark/light theme support; Responsive reading interface with font size controls; Mobile-optimized navigation; Enhanced sidebar with smooth scrolling, optimized touch targets (44-48px height buttons), improved typography (14-15px font sizes, medium weight), Framer Motion animations (scale, translate on hover), touch-friendly gestures (swipe-to-close), focus management, high contrast, dark mode, and reduced motion support; Visual depth with gradient overlays and subtle shadows.

### Backend
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with bcryptjs
- **Security**: CSRF protection, rate limiting, CORS, Helmet
- **API Design**: RESTful JSON API

### Data Management
- **Database Schema**: Users (authentication, profiles, admin roles), Posts (stories with categories, tags, metadata, reading time), Comments (threaded), Bookmarks, Categories & Tags, Site Settings.
- **Content Synchronization**: Automatic content sync primarily from WordPress API every 5 minutes, with local storage and server-side API as fallbacks.
- **Authentication Flow**: Session-based with secure cookies, CSRF protection, rate limiting, automatic session renewal.
- **API Request Flow**: CSRF tokens included, rate limiting applied, error handling, automatic retry logic.

### Core Features
- **Content Management**: Admin content creation/editing, community post submission, categorization, reading time calculation, WordPress API integration.
- **User Management**: Registration, authentication, profile management, admin user management, role-based access control.
- **Reader Experience**: Responsive design, theme support, progress tracking, bookmarking, interactive elements, mobile optimization.
- **Administrative Features**: Consolidated admin menu with sections for Dashboard, Content Management (Stories, Content, WordPress Sync), User Management (Users, Moderation), and Insights & Reports (Analytics, Statistics, Feedback, Bug Reports).
- **Deployment Strategy**: Split architecture with Frontend on Vercel, Backend on Render, and PostgreSQL on Neon. Cross-domain CORS, secure cookie configuration, environment-specific rate limiting, database connection pooling. HTTPS enforcement, SameSite=None cookies, IP whitelisting.

## External Dependencies
- **React Ecosystem**: React, React DOM, React Query
- **UI Framework**: Radix UI, shadcn/ui, Tailwind CSS
- **State Management**: Zustand, React Hook Form
- **Database**: Drizzle ORM, PostgreSQL driver
- **Authentication**: bcryptjs, express-session
- **Security**: helmet, express-rate-limit, CORS
- **Validation**: Zod
- **Animations**: Framer Motion, React Confetti
- **Typography**: React Simple Typewriter, React Scramble
- **Icons**: Lucide React, React Icons
- **Analytics**: PostHog
- **Performance**: Web Vitals
- **Content Source**: WordPress API (bubbleteameimei.wordpress.com)