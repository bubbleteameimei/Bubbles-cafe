/**
 * Simple test script to check if our files have been updated correctly
 */

const fs = require('fs');
const path = require('path');

// Path to the SimpleCommentSection.tsx file
const commentSectionPath = path.resolve('client/src/components/blog/SimpleCommentSection.tsx');

// Check if the file exists
if (!fs.existsSync(commentSectionPath)) {
  console.error(`Error: Could not find ${commentSectionPath}`);
  process.exit(1);
}

// Read the file
const content = fs.readFileSync(commentSectionPath, 'utf8');

// Check for specific patterns
const patterns = [
  // Check if there's a reference to name input field (should not exist)
  {
    pattern: 'input[placeholder="Your name"]',
    shouldExist: false,
    message: 'Name input field reference found, should be removed'
  },
  // Check if the user's username or "Anonymous" is shown
  {
    pattern: 'isAuthenticated ? user?.username : "Anonymous"',
    shouldExist: true,
    message: 'Missing logic to display username or "Anonymous"'
  },
  // Check for setName removal
  {
    pattern: 'const [name, setName] = useState',
    shouldExist: false,
    message: 'Name state variable still exists'
  },
  // Check if ReplyForm is properly handling anonymous users
  {
    pattern: 'const replyAuthor = isAuthenticated && user ? user.username : "Anonymous"',
    shouldExist: true,
    message: 'ReplyForm is not properly handling anonymous users'
  }
];

// Check each pattern
console.log('Testing SimpleCommentSection.tsx for anonymous user handling:');
console.log('=====================================================');

let allPassedFlag = true;

patterns.forEach(({ pattern, shouldExist, message }) => {
  const exists = content.includes(pattern);
  const passed = exists === shouldExist;
  
  console.log(`${passed ? '✓' : '✗'} ${shouldExist ? 'Found' : 'Did not find'} ${pattern.substring(0, 40)}${pattern.length > 40 ? '...' : ''}`);
  
  if (!passed) {
    console.log(`  Error: ${message}`);
    allPassedFlag = false;
  }
});

console.log('=====================================================');
console.log(allPassedFlag ? 'All tests passed!' : 'Some tests failed!');

process.exit(allPassedFlag ? 0 : 1);