# Website Backup - March 25, 2025

## Contents
This backup contains the following components:
- Client-side code (React application)
- Server-side code (Express API)
- Shared code (schemas, types, and configurations)
- Configuration files (package.json, tailwind.config.ts, etc.)
- Database schema information

## Horror Easter Egg Changes
The following modifications were made to the horror easter egg:
1. Changed from Cinzel Decorative font to the website's header fonts (Castoro Titling, Gilda Display, Newsreader, Cormorant Garamond)
2. Implemented random text glitching with unpredictable timing
3. Enhanced the effect with randomized blur effects and letter spacing
4. Maintained pure red (#ff0000) color with no color mixing or text shadows

## Key Files
- `/client/src/components/errors/CreepyTextGlitch.tsx`: Contains the horror easter egg implementation
- `/shared/schema.ts`: Contains database schema definitions
- `/client/src/pages/reader.tsx`: Reader page that handles story navigation

## Database Information
- PostgreSQL database contains 39 tables
- Currently holds 21 content posts
- See `database-schema.sql` for detailed schema information

## Restoration Instructions
1. Copy all directories and files back to their original locations
2. Run `npm install` to restore dependencies
3. Start the application with `npm run dev`

**Backup created by: Replit Expert Software Developer**