# Interactive Storytelling Platform

## Overview

This is a modern interactive storytelling platform built with React, TypeScript, Express.js, and PostgreSQL. The application provides a comprehensive platform for reading, writing, and sharing interactive stories with user authentication, content management, and administrative features.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with shadcn/ui components and Radix UI primitives
- **State Management**: Zustand for global state, React Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Custom components built on Radix UI with accessibility features

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based authentication with bcryptjs password hashing
- **Security**: CSRF protection, rate limiting, CORS configuration, Helmet security headers
- **API Design**: RESTful API with JSON responses

### Database Schema
- **Users**: Authentication, profiles, admin roles
- **Posts**: Stories with categories, tags, metadata, reading time
- **Comments**: Threaded comments system
- **Bookmarks**: User bookmarking functionality
- **Categories & Tags**: Content organization
- **Site Settings**: Application configuration

## Key Components

### Content Management
- WordPress API integration for automatic content synchronization
- Admin content creation and editing interface
- Community post submission system
- Content categorization (Horror, Supernatural, etc.)
- Reading time calculation and progress tracking

### User Management
- User registration and authentication
- Profile management with customizable settings
- Admin user management interface
- Role-based access control

### Reader Experience
- Responsive reading interface with font size controls
- Dark/light theme support
- Progress tracking and bookmarking
- Interactive elements and animations
- Mobile-optimized navigation

### Enhanced Sidebar Navigation
- Smooth scrolling behavior with hidden scrollbars for clean appearance
- Enhanced button styling with proper spacing (44-48px height for optimal touch targets)
- Improved typography with 14-15px font sizes and medium weight for better readability
- Motion animations with hover effects (scale, translate) using Framer Motion
- Touch-friendly mobile gestures including swipe-to-close functionality
- Accessibility features including focus management and high contrast support
- Dark mode and reduced motion support for user preferences
- Visual depth with gradient overlays and subtle shadows

### Administrative Features
- Consolidated admin menu with 4 main sections:
  - Dashboard
  - Content Management (Stories, Content, WordPress Sync)
  - User Management (Users, Moderation)
  - Insights & Reports (Analytics, Statistics, Feedback, Bug Reports)

## Data Flow

### Content Synchronization
1. WordPress API automatically syncs content every 5 minutes
2. Local storage fallback for offline functionality
3. Server-side API as secondary fallback
4. Real-time content updates through proper cache invalidation

### Authentication Flow
1. Session-based authentication with secure cookies
2. CSRF protection on all state-changing operations
3. Rate limiting for authentication endpoints
4. Automatic session renewal and cleanup

### API Request Flow
1. Client requests include CSRF tokens automatically
2. Rate limiting applied based on user authentication status
3. Error handling with proper user feedback
4. Automatic retry logic for failed requests

## External Dependencies

### Core Libraries
- **React Ecosystem**: React, React DOM, React Query
- **UI Framework**: Radix UI, shadcn/ui, Tailwind CSS
- **State Management**: Zustand, React Hook Form
- **Database**: Drizzle ORM, PostgreSQL driver
- **Authentication**: bcryptjs, express-session
- **Security**: helmet, express-rate-limit, CORS
- **Validation**: Zod for schema validation

### Enhanced Features
- **Animations**: Framer Motion, React Confetti
- **Typography**: React Simple Typewriter, React Scramble
- **Icons**: Lucide React, React Icons
- **Analytics**: PostHog for user behavior tracking
- **Performance**: Web Vitals monitoring

## Deployment Strategy

### Split Deployment Architecture
- **Frontend**: Deployed on Vercel for optimal React/Vite performance
- **Backend**: Deployed on Render for Node.js/Express API
- **Database**: PostgreSQL hosted on Neon for serverless scaling
- **Assets**: Static assets served through Vercel's CDN

### Environment Configuration
- Cross-domain CORS setup for frontend-backend communication
- Secure cookie configuration for cross-domain authentication
- Environment-specific rate limiting and security settings
- Database connection pooling for production scalability

### Security Considerations
- HTTPS enforcement for all cross-domain communications
- SameSite=None cookies for cross-domain session management
- IP whitelisting for development environments
- Comprehensive rate limiting strategy

## Database Setup

### Database Successfully Initialized (August 12, 2025 - Current Session)
- ✅ **PostgreSQL Database**: Fresh Neon PostgreSQL database created and connected successfully (DATABASE_URL configured)
- ✅ **Environment Variables**: All database connection variables properly configured (DATABASE_URL, PGPORT, PGUSER, PGPASSWORD, PGDATABASE, PGHOST)
- ✅ **Database Schema**: Modern Drizzle schema pushed successfully with all tables created via `npx drizzle-kit push`
- ✅ **Database Tables**: All core tables operational including new tables (reading_streaks, user_notifications, tag_relations, user_preferences)
- ✅ **Admin User**: Admin user created (vantalison@gmail.com/admin123)
- ✅ **WordPress Content**: 21 authentic stories imported from WordPress API (BLOOD, WORD, HUNGER, SONG, JOURNAL, NOSTALGIA, etc.)
- ✅ **Application Running**: Server successfully started and responding on http://0.0.0.0:3000 with all security middleware active
- ✅ **WordPress Sync**: Automatic content sync active every 5 minutes, importing and updating WordPress stories
- ✅ **Security Headers**: CSRF protection, CORS, Helmet security headers, and content security policy active
- ✅ **Session Management**: Authentication system ready with secure session handling
- ✅ **Replit Preview Fixed**: Changed server port from 3002 to 3000 for Replit preview compatibility

### Automatic Database Initialization
- **Modern Commands**: Updated to use current Drizzle Kit commands with fallback compatibility
- **Startup Integration**: Database setup runs automatically on every application start
- **Direct Connection**: Bypasses command-line tool issues with direct database connection verification
- **Admin User Creation**: Automatically creates default admin user (username: vandalison, email: vandalison@gmail.com)
- **Environment Detection**: Adapts to Replit and other deployment environments
- **Graceful Degradation**: Application starts even if database setup encounters issues

### Database Scripts Available
- `scripts/direct-db-setup.ts` - Direct database connection and table verification
- `scripts/permanent-startup.ts` - Comprehensive startup routine for all environments
- `db-setup.js` - Node.js fallback script with multiple Drizzle command attempts
- `DATABASE_SETUP.md` - Complete documentation for database setup process

## Content Management

### Sample Story Removal
- **Clean WordPress Content**: Removed all sample/demo stories from reader and database
- **WordPress API Only**: Reader now displays only authentic content from WordPress API
- **Database Cleanup**: Removed 3 sample stories ("Welcome to Our Digital Storytelling Platform", "The Art of Interactive Storytelling", "Building Your First Interactive Story")
- **Current Content**: 21 WordPress stories with titles like "BLOOD", "WORD", "HUNGER", etc.
- **Automated Script**: Created `scripts/remove-sample-stories.ts` for future cleanup if needed

### Content Sources
- **Primary**: WordPress API (bubbleteameimei.wordpress.com) - automatically synced every 5 minutes
- **Secondary**: Community posts from authenticated users
- **Removed**: All sample/demo/placeholder content

## Changelog

```
Changelog:
- July 28, 2025. ✅ **SIMPLIFIED BLOOD DRIPPING USING EXACT HTML CODE** - Replaced complex system with exact implementation from provided HTML reference. Uses simple Particle class with basic physics (gravity 0.05, width 0.5-1.5px), clear canvas rendering without trails, direct text rendering on canvas, bottom-edge pixel detection for drip points, and fixed positioning. Blood drips directly from "CAFE" text with pixel-perfect accuracy using the exact code structure requested.
- July 28, 2025. ✅ **BLOOD DRIPPING EFFECT ADDED** - Created dramatic blood dripping animation from the red "CAFE" text in the homepage title. Features 5 individual blood drops with staggered timing, realistic physics simulation, and interactive hover effects. Includes subtle blood stains on button hovers for enhanced horror atmosphere.
- July 28, 2025. ✅ **SIGN-IN BUTTON UPDATED TO ICON** - Converted sign-in button from text to User icon to match the icon-based styling of other navigation buttons. Cleaned up unused imports and variables in navigation component. Sidebar functionality remains intact using Sheet-based implementation.
- July 28, 2025. ✅ **UI IMPROVEMENTS COMPLETE** - Removed music/sound button from header navigation as requested. Fixed sidebar to work in all screen sizes (not just mobile) by removing fixed desktop sidebar and making sheet menu available on all devices. Fixed homepage automatic scrolling issue by disabling smooth scroll behavior in CSS and preventing scroll restoration on homepage in loading screen component. All UI elements now function properly across all device types.
- July 28, 2025. ✅ **DATABASE AND APPLICATION SETUP COMPLETE (Current Session)** - Fresh PostgreSQL database created with all core tables via Drizzle schema push. Admin user created (vantalison@gmail.com / admin123). Sample content initialized. Server running successfully on port 3002 with all security middleware active. Interactive storytelling platform ready for development and testing.
- July 28, 2025. ✅ **BUBBLES CAFE PLATFORM FULLY OPERATIONAL** - Complete interactive storytelling platform running successfully on port 3002. PostgreSQL database with 21 authentic WordPress stories. WordPress sync active every 5 minutes. Admin user (vantalison@gmail.com) confirmed. All features working: story browsing, reading interface, performance tracking, responsive design. Application ready for user interaction.
- July 28, 2025. ✅ **DATABASE AND APPLICATION SETUP COMPLETE** - Fresh PostgreSQL database created on Replit with all core tables (users, posts, comments, sessions, bookmarks, author_stats). Admin user created (vandalison@gmail.com/admin123). WordPress sync imported 21 authentic stories. Server running on port 3003 with all API endpoints functional.
- July 27, 2025. ✅ **COMPREHENSIVE HOMEPAGE COMPACTION** - Moved all elements upward by reducing spacing after title (24-64px to 8-24px), tightening content spacing throughout, minimizing button margins, and bringing Latest Story section closer. All homepage content now more compact and visually cohesive.
- July 27, 2025. ✅ **HOMEPAGE BUTTON AND CONTENT SPACING** - Reduced gap between Browse Stories and Start Reading buttons (from gap-5 to gap-3). Added more spacing between Start Reading button and Latest Story text (mt-6 to mt-12). Applied flexbox layout to better distribute homepage content vertically.
- July 27, 2025. ✅ **BUBBLES CAFE TITLE ENHANCEMENT** - Moved title even higher (barrier height now 2-4px) and increased font sizes significantly across all breakpoints (text-7xl to text-11xl). Title now has maximum visual impact and optimal positioning near navigation.
- July 27, 2025. ✅ **HOMEPAGE LAYOUT OPTIMIZATION** - Moved all homepage elements upward by reducing spacing throughout. Reduced header barrier height, content padding, and spacing between elements. Minimized the large spacing gap after title. Removed text shadow from "Latest Story" text for consistency.
- July 27, 2025. ✅ **HEADER AND FOOTER STYLING UPDATES** - Centralized footer elements for better alignment. Removed text shadow from "BUBBLES CAFE" header text. Changed header font from font-bodoni to font-serif for better readability. Updated "BUBBLE'S" to "BUBBLES" and ensured only "CAFE" has blood red color.
- July 27, 2025. ✅ **BUY ME A COFFEE BUTTON FIX** - Fixed Paystack popup issue where multiple payment windows could open repeatedly. Added processing state with visual feedback (loading spinner, disabled state, "Opening payment..." text). Applied fix to both BuyMeCoffeeButton and SupportWritingCard components. Fixed TypeScript animation errors. Application running on port 3004.
- July 27, 2025. ✅ **DATABASE AND APPLICATION SETUP COMPLETE (Current Session)** - Fresh PostgreSQL database created and fully configured. All essential tables created via SQL (users, posts, comments, sessions, site_settings, author_stats, bookmarks, analytics). Admin user created (vandalison@gmail.com/admin123). Application successfully running on port 3003 with WordPress sync active and importing stories. All API endpoints functional with 9 posts imported.
- July 27, 2025. ✅ **COMPLETE DATABASE AND APPLICATION SETUP** - Created fresh PostgreSQL database, manually created all essential tables (users, posts, comments, sessions, etc.), initialized admin user (vandalison@gmail.com), and successfully started application on port 3003 with WordPress sync importing 21 stories
- July 27, 2025. ✅ **HOMEPAGE BUTTON ENHANCEMENTS** - Enhanced Browse Stories and Start Reading buttons with vibrant gradient colors, reduced width, smooth click animations, and continuous icon movements
- July 27, 2025. ✅ **IMPORT ERRORS RESOLVED** - Fixed missing requestLogger and errorLogger imports in server files for proper functionality
- July 27, 2025. ✅ **WORDPRESS SYNC ACTIVE** - Content synchronization working and importing stories automatically
- July 25, 2025. ✅ **LIKE/DISLIKE BUTTONS ENHANCED** - Redesigned with modern styling, sans-serif fonts, hover effects, and improved accessibility
- July 25, 2025. ✅ PostgreSQL database provisioned with DATABASE_URL environment variable
- July 25, 2025. ✅ All core database tables created via SQL (users, posts, author_stats, sessions, site_settings)
- July 25, 2025. ✅ Admin user created: vandalison@gmail.com / admin123 password
- July 25, 2025. ✅ Application server running on port 3003 with all features operational
- July 25, 2025. ✅ WordPress sync imported 21 stories automatically on startup
- July 23, 2025. ✅ **SIDEBAR CLOSE BUTTON REMOVED** - Removed X close button from sidebar sheet menu per user request
- July 23, 2025. ✅ Fixed swipe-to-close functionality to work without close button using escape key events
- July 23, 2025. ✅ Updated swipe gesture mechanism for better touch interaction on mobile devices
- July 23, 2025. ✅ **DATABASE SETUP COMPLETE** - PostgreSQL database created and all tables initialized
- July 23, 2025. ✅ Database connection verified and environment variables configured
- July 23, 2025. ✅ Core tables created: users, posts, comments, bookmarks, author_stats  
- July 23, 2025. ✅ Default admin user created (username: admin, password: admin123)
- July 23, 2025. ✅ **APPLICATION FULLY OPERATIONAL** - Server running on port 3003 with complete functionality
- July 23, 2025. ✅ WordPress content sync activated and running every 5 minutes
- July 22, 2025. ✅ **SIDEBAR NAVIGATION ENHANCED** - Smooth scrolling, better spacing, improved typography and button heights
- July 22, 2025. ✅ Enhanced sidebar with motion animations, proper font sizing (14px-15px), and 44-48px button heights
- July 22, 2025. ✅ Added smooth scroll behavior with hidden scrollbars and touch-friendly mobile gestures
- July 22, 2025. ✅ Created comprehensive sidebar-enhanced.css with accessibility, dark mode, and reduced motion support
- July 22, 2025. ✅ **FULL APPLICATION SETUP COMPLETE** - Database and application fully operational
- July 22, 2025. ✅ PostgreSQL database provisioned and connected successfully
- July 22, 2025. ✅ All core database tables created (users, posts, comments, bookmarks, reading_progress, secret_progress, author_stats)
- July 22, 2025. ✅ Admin user created successfully (username: admin, password: admin123)
- July 22, 2025. ✅ WordPress content sync fully operational - 20 stories loading from WordPress API
- July 22, 2025. ✅ Application running successfully with complete web interface and all features functional
- July 22, 2025. ✅ Frontend loading perfectly with performance tracking, animations, and responsive design
- July 14, 2025. Completed comprehensive background image removal from entire website
- July 14, 2025. Cleaned up all background image references from components, CSS, and preloaders
- July 14, 2025. Maintained clean dark theme without background images while preserving about page profile pictures
- July 14, 2025. Database fully configured with PostgreSQL connection and WordPress content sync
- July 14, 2025. Updated database commands to work with current Drizzle Kit version
- July 14, 2025. All required tables created and seeded with 23 posts from WordPress API
- July 14, 2025. Environment variables properly configured for database connection
- July 01, 2025. Removed all sample stories from reader - only WordPress API content remains
- July 01, 2025. Database setup automated with modern commands and permanent startup process
- July 01, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
GitHub repository: https://github.com/corpse777/interactive-storytelling-platform
Personal access token configured for Git authentication
```