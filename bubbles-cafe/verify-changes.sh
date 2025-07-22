#!/bin/bash

echo "==== Verifying UI Changes ===="

# Check if the server is running on port 3001
if ! curl -s "http://localhost:3001/" -o /dev/null; then
  echo "ERROR: Server is not running on port 3001"
  exit 1
fi

echo "✅ Server is running on port 3001"

# Fetch the reader page HTML
echo "Fetching reader page HTML..."
READER_HTML=$(curl -s "http://localhost:3001/reader/blood")

# Check for slim navigation
echo "Checking for slimmed navigation bar..."
if echo "$READER_HTML" | grep -q "floating-navigation"; then
  echo "✅ Floating navigation component found"
else
  echo "❌ Floating navigation component not found"
fi

# Check for fullwidth CSS
echo "Checking for fullwidth fixes..."
if echo "$READER_HTML" | grep -q "fullwidth-fix.css"; then
  echo "✅ Fullwidth CSS fixes found"
else
  echo "❌ Fullwidth CSS fixes not found"
fi

# Check for Table of Contents
echo "Checking for Table of Contents component..."
if echo "$READER_HTML" | grep -q "TableOfContents"; then
  echo "✅ Table of Contents component found"
  
  # Check for story count display
  if echo "$READER_HTML" | grep -q "total-stories-count" || echo "$READER_HTML" | grep -q "totalStoriesCount"; then
    echo "✅ Story count display likely implemented"
  else
    echo "⚠️ Story count display may not be implemented or has a different identifier"
  fi
else
  echo "❌ Table of Contents component not found"
fi

# Fetch the index HTML
echo "Fetching index HTML..."
INDEX_HTML=$(curl -s "http://localhost:3001/")

# Check for loading provider
echo "Checking for loading provider..."
if echo "$INDEX_HTML" | grep -q "LoadingProvider"; then
  echo "✅ Loading provider component found"
else
  echo "❌ Loading provider component not found"
fi

# Check for loading screen animation
echo "Checking for loading screen animation..."
if echo "$INDEX_HTML" | grep -q "letter-by-letter" || echo "$INDEX_HTML" | grep -q "typing-effect"; then
  echo "✅ Loading screen animation likely implemented"
else
  echo "⚠️ Loading screen animation may not be detected in the HTML source"
fi

echo "==== Verification Complete ===="