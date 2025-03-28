# Test Directory

This directory contains organized test files for the project.

## Organization

Tests are organized into the following categories:

- **admin/** - Tests for admin panel, authentication, and user management
- **comments/** - Tests for the comment system functionality
- **content/** - Tests for content handling, excerpts, and text processing
- **feedback/** - Tests for the user feedback system
- **general/** - General tests that don't fit other categories
- **reader/** - Tests for the reader experience, reading modes, and related features
- **security/** - Tests for CSRF protection, authentication security, and related features
- **visual/** - Screenshot tests and visual verification tests
- **wordpress/** - Tests for WordPress API integration and related functionality

## Running Tests

Most tests can be run using:

```
node tests/[category]/[test-file].js
```

HTML test files can be opened in the browser directly.

## Test Migration

These tests were automatically migrated from the project root to reduce clutter
while preserving test functionality.
