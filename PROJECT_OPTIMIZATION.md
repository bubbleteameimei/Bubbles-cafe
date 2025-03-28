# Project Optimization Guide

This document describes the optimization scripts available to clean up and organize the project files.

## Available Scripts

### Clean Project

```bash
node clean-project.js           # Run optimization (live mode)
node clean-project.js --dry     # Show what would be removed without making changes (dry run)
```

The clean-project script combines all optimization strategies to reduce the overall project size:
1. Removes duplicate image files
2. Removes duplicate audio files
3. Manages large log files
4. Cleans up backup directories
5. Removes temporary and backup files
6. Identifies old test files for potential organization
7. Analyzes disk space usage and provides recommendations
8. Provides detailed reporting on space savings

### Optimize Images

```bash
node optimize-images.js
```

This script identifies and removes duplicate image files across various directories in the project, keeping only the original version in a single location.

### Optimize Audio

```bash
node optimize-audio.js
```

This script identifies and removes duplicate audio files across various directories in the project, keeping only the original version in a single location.

### Manage Log Files

```bash
node manage-logs.js
```

This script compresses or trims large log files to reduce disk space usage:
- For `debug.log` files: Trims to last 1000 lines to keep recent logs
- For other large log files: Compresses using gzip to reduce size

### Organize Tests

```bash
node organize-tests.js          # Run organization (live mode)
node organize-tests.js --dry    # Show what would be moved without making changes (dry run)
```

This script organizes all test files scattered at the root level into a structured test directory with categories:
- admin/ - Tests for admin panel, authentication, and user management
- comments/ - Tests for the comment system functionality
- content/ - Tests for content handling, excerpts, and text processing
- feedback/ - Tests for the user feedback system
- general/ - General tests that don't fit other categories
- reader/ - Tests for the reader experience, reading modes, and related features
- security/ - Tests for CSRF protection, authentication security, and related features
- visual/ - Screenshot tests and visual verification tests
- wordpress/ - Tests for WordPress API integration and related functionality

## Disk Space Management Recommendations

Based on analysis of the largest directories:

1. For node_modules (≈776MB):
   - Use --production flag when deploying to eliminate dev dependencies
   - Consider using a package manager that supports pruning unused dependencies

2. For .git (≈163MB):
   - Consider using a shallow clone or remove .git directory in production
   - Periodically run git gc to clean up and compact the repository

3. For backup directories (≈341MB):
   - Keep only the most recent backup (backup-latest)
   - Remove old backups that are no longer needed

4. For logs (variable size):
   - Use a centralized logging service instead of file-based logging
   - Implement log rotation with size limits
   - Consider using a service like Papertrail or Loggly for production environments

5. For build artifacts:
   - Add build directories to .gitignore
   - Clean before deployment with `npm run clean` or equivalent

6. For media files:
   - Use cloud storage services for media files in production
   - Implement proper image optimization with WebP format
   - Consider using a CDN for frequently accessed media