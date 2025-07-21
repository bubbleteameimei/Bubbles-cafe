# Interactive Storytelling Platform

A modern, AI-powered digital storytelling platform that creates immersive and interactive narrative experiences. Built with cutting-edge technologies for enhanced user engagement and seamless content management.

## 🌟 Features

- **Interactive Stories**: Immersive reading experience with dynamic content
- **User Authentication**: Secure login system with admin panel
- **WordPress Integration**: Automatic content synchronization from WordPress API
- **Content Management**: Full CRUD operations for stories, categories, and user management
- **Responsive Design**: Mobile-first design with dark/light theme support
- **Real-time Updates**: Live content synchronization and user interactions
- **Admin Dashboard**: Comprehensive admin interface for content and user management
- **Reading Progress**: Track reading progress and bookmark favorite stories
- **Comment System**: Threaded comments with moderation features

## 🚀 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **Tailwind CSS** with shadcn/ui components
- **Zustand** for state management
- **React Query** for server state management
- **Wouter** for lightweight routing
- **Framer Motion** for animations

### Backend
- **Express.js** with TypeScript
- **PostgreSQL** with Drizzle ORM
- **Session-based authentication**
- **CORS configuration** for cross-domain deployment
- **Rate limiting** and security middleware

### Database
- **PostgreSQL** hosted on Neon
- **Drizzle ORM** for type-safe database operations
- **Automatic migrations** and seeding
- **Session storage** with PostgreSQL

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- WordPress site (optional, for content sync)

### Environment Variables
```bash
DATABASE_URL=postgresql://username:password@host:port/database
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
NODE_ENV=development
```

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd interactive-storytelling-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npm run db:push
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3003`

## 📱 Usage

### Default Admin Credentials
- **Username**: `admin`
- **Email**: `admin@storytelling.local`
- **Password**: `admin123`

⚠️ **Important**: Change the default password after first login!

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio

## 🏗️ Architecture

### Database Schema
- **Users**: Authentication and user profiles
- **Posts**: Stories with categories, tags, and metadata
- **Comments**: Threaded comment system
- **Bookmarks**: User bookmarking functionality
- **Categories & Tags**: Content organization
- **Reading Progress**: Track user reading progress

### API Endpoints
- `GET /api/posts` - Retrieve stories
- `POST /api/posts` - Create new story (admin)
- `GET /api/posts/:id` - Get single story
- `POST /api/comments` - Add comment
- `GET /api/users/profile` - Get user profile
- `POST /api/bookmarks` - Bookmark story

### WordPress Integration
- Automatic content sync every 5 minutes
- Supports categories, tags, and featured images
- Fallback system for offline functionality
- Real-time content updates

## 🔧 Development

### Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and helpers
│   │   └── hooks/         # Custom React hooks
├── server/                # Express backend
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   ├── utils/            # Server utilities
│   └── services/         # Business logic
├── shared/               # Shared types and schemas
│   ├── schema.ts         # Database schema
│   └── types/            # TypeScript types
└── scripts/              # Database and setup scripts
```

### Code Style
- TypeScript for type safety
- ESLint and Prettier for code formatting
- Conventional commits for version control
- Component-driven development

## 🚢 Deployment

### Recommended Architecture
- **Frontend**: Vercel (optimized for React/Vite)
- **Backend**: Render (Node.js/Express hosting)
- **Database**: Neon (serverless PostgreSQL)

### Environment Setup
1. Set up environment variables for each platform
2. Configure CORS for cross-domain communication
3. Set up automatic deployments from GitHub
4. Configure database connection pooling

## 📈 Performance Features

- **Code splitting** for optimal loading
- **Image optimization** and lazy loading
- **Caching strategy** for API responses
- **Database indexing** for query optimization
- **Session management** with PostgreSQL store

## 🔐 Security Features

- **CSRF protection** on all state-changing operations
- **Rate limiting** for API endpoints
- **Secure session management** with HTTP-only cookies
- **Input validation** with Zod schemas
- **SQL injection protection** with Drizzle ORM

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Bug Reports & Feature Requests

Please use the GitHub Issues tab to report bugs or request features.

## 📧 Contact

For questions and support, please contact the development team.

---

**Built with ❤️ using modern web technologies**