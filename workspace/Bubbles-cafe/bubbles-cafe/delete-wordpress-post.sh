#!/bin/bash

# Delete WordPress Post 272 Script
# This script will delete the placeholder WordPress post with ID 272.
# 
# Usage:
#   ./delete-wordpress-post.sh        # Run with default settings
#   ./delete-wordpress-post.sh -q     # Run in quiet mode (minimal output)
#   ./delete-wordpress-post.sh -v     # Run in verbose mode (maximum output)
#   ./delete-wordpress-post.sh -h     # Show help message

# Default settings
VERBOSE=0
QUIET=0
HOST="localhost"
PORT="3001"
POST_ID=272
SERVER_URL="http://${HOST}:${PORT}"
ENDPOINT="/admin-cleanup/wordpress-post-272"

# Process command line arguments
while getopts "qvh" opt; do
  case $opt in
    q) QUIET=1 ;;
    v) VERBOSE=1 ;;
    h) 
      echo "Usage: ./delete-wordpress-post.sh [-q|-v|-h]"
      echo "  -q   Quiet mode (minimal output)"
      echo "  -v   Verbose mode (detailed output)"
      echo "  -h   Show this help message"
      exit 0
      ;;
    \?) 
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
  esac
done

# Utility functions
log() {
  if [[ $QUIET -eq 0 ]]; then
    echo "$@"
  fi
}

verbose_log() {
  if [[ $VERBOSE -eq 1 ]]; then
    echo "$@"
  fi
}

# Check server health first
log "Checking server health..."
HEALTH_CHECK=$(curl -s "${SERVER_URL}/health")

if [[ $? -ne 0 || -z "$HEALTH_CHECK" ]]; then
  log "❌ Error: Server does not appear to be running at ${SERVER_URL}"
  exit 1
fi

verbose_log "Server is responding: $(echo $HEALTH_CHECK | json_pp)"

# Check if the post exists
log "Checking if post ${POST_ID} exists before deletion..."
POST_INFO=$(curl -s "${SERVER_URL}/api/posts/${POST_ID}")
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${SERVER_URL}/api/posts/${POST_ID}")

if [[ $HTTP_CODE -eq 404 || $POST_INFO == *"message":"Post not found"* ]]; then
  log "ℹ️ Post ${POST_ID} does not exist. Nothing to delete."
  exit 0
fi

verbose_log "Post exists: $(echo $POST_INFO | json_pp)"

# Extract post title for confirmation
POST_TITLE=$(echo $POST_INFO | grep -o '"title":"[^"]*"' | cut -d'"' -f4)
log "Attempting to delete WordPress post: \"${POST_TITLE}\" (ID: ${POST_ID})..."

# Send the DELETE request
if [[ $VERBOSE -eq 1 ]]; then
  RESPONSE=$(curl -v -X DELETE "${SERVER_URL}${ENDPOINT}" 2>&1)
  DELETE_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "${SERVER_URL}${ENDPOINT}")
  verbose_log "Full response:"
  verbose_log "$RESPONSE"
  verbose_log "HTTP status code: $DELETE_CODE"
else
  RESPONSE=$(curl -s -X DELETE "${SERVER_URL}${ENDPOINT}")
  DELETE_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "${SERVER_URL}${ENDPOINT}")
fi

# Check for errors based on HTTP status code first
if [[ $DELETE_CODE -eq 404 ]]; then
  log "ℹ️ Post ${POST_ID} not found during deletion. It may have been deleted already."
  # Verify this with a get request
  VERIFY_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${SERVER_URL}/api/posts/${POST_ID}")
  
  if [[ $VERIFY_CODE -eq 404 ]]; then
    log "✅ Confirmed: Post ${POST_ID} does not exist in the system."
    exit 0
  else
    log "⚠️ Warning: Inconsistent state. Post should be deleted but returned code: $VERIFY_CODE"
    exit 1
  fi
elif [[ $DELETE_CODE -ne 200 ]]; then
  log "❌ Error: Deletion request failed with status code: $DELETE_CODE"
  log "Response: $RESPONSE"
  exit 1
fi

# Check response body for errors
if [[ $RESPONSE == *"error"* || $RESPONSE == *"Error"* || $RESPONSE == *"failed"* ]]; then
  log "❌ Error in response: $RESPONSE"
  exit 1
fi

# Extract response data
RESPONSE_TITLE=$(echo $RESPONSE | grep -o '"title":"[^"]*"' | cut -d'"' -f4)
RESPONSE_ID=$(echo $RESPONSE | grep -o '"postId":[0-9]*' | cut -d':' -f2)
RESPONSE_DATE=$(echo $RESPONSE | grep -o '"deletedAt":"[^"]*"' | cut -d'"' -f4)

if [[ -n "$RESPONSE_TITLE" || -n "$RESPONSE_ID" || -n "$RESPONSE_DATE" ]]; then
  log "🗑️ Post deleted successfully:"
  [[ -n "$RESPONSE_TITLE" ]] && log "   Title: ${RESPONSE_TITLE}"
  [[ -n "$RESPONSE_ID" ]] && log "   ID: ${RESPONSE_ID}"
  [[ -n "$RESPONSE_DATE" ]] && log "   Deleted at: ${RESPONSE_DATE}"
else
  log "🗑️ Post deleted successfully."
fi

# Verify that the post was actually deleted
log "Verifying deletion..."
VERIFY_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${SERVER_URL}/api/posts/${POST_ID}")

if [[ $VERIFY_CODE -eq 404 ]]; then
  log "✅ Verification successful: The post has been permanently removed."
  exit 0
else
  VERIFY=$(curl -s "${SERVER_URL}/api/posts/${POST_ID}")
  log "❌ Warning: The post still appears to exist (HTTP ${VERIFY_CODE})."
  verbose_log "Post data: $(echo $VERIFY | json_pp)"
  exit 1
fi