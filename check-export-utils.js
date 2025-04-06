#!/usr/bin/env node

// This script tests the data export functionality with a sample user data object
// It mocks the browser environment functions needed for export

const mockBlobConstructor = (data, options) => {
  console.log('\n[MOCK] Creating Blob with:');
  console.log('- Data type:', Array.isArray(data) ? 'Array with length ' + data.length : typeof data);
  console.log('- Options:', options);
  console.log('- First 100 chars:', typeof data[0] === 'string' ? data[0].substring(0, 100) + '...' : 'Not a string');
  return { type: options.type || 'text/plain' };
};

// Mock URL object
global.URL = {
  createObjectURL: (blob) => {
    console.log('[MOCK] Created URL object for blob of type:', blob.type);
    return 'mock://blob-url';
  },
  revokeObjectURL: (url) => {
    console.log('[MOCK] Revoked URL:', url);
  }
};

// Mock DOM methods
global.document = {
  createElement: (tag) => {
    console.log('[MOCK] Created element:', tag);
    return {
      href: '',
      download: '',
      click: () => console.log('[MOCK] Element clicked (download triggered)')
    };
  },
  body: {
    appendChild: (el) => console.log('[MOCK] Appended element with href:', el.href, 'and download name:', el.download),
    removeChild: (el) => console.log('[MOCK] Removed element with href:', el.href)
  }
};

// Mock window.open
global.window = {
  open: (url, target) => {
    console.log('[MOCK] Window opened with target:', target);
    return {
      document: {
        write: (html) => console.log('[MOCK] Writing HTML to window (length:', html.length, 'chars)'),
        close: () => console.log('[MOCK] Document closed')
      },
      onload: null,
      onerror: null,
      focus: () => console.log('[MOCK] Window focused'),
      print: () => console.log('[MOCK] Print dialog opened')
    };
  }
};

// Mock console for testing
const originalConsole = { ...console };
global.console = {
  ...console,
  error: (msg, ...args) => {
    originalConsole.error('\x1b[31m[TEST ERROR]\x1b[0m', msg, ...args);
  },
  log: (msg, ...args) => {
    if (typeof msg === 'string' && msg.includes('[Export]')) {
      originalConsole.log('\x1b[34m[TEST LOG]\x1b[0m', msg, ...args);
    }
  }
};

// Mock alert
global.alert = (msg) => {
  console.log('[MOCK] Alert:', msg);
};

// Mock Blob constructor
global.Blob = mockBlobConstructor;

// Sample test data
const testUserData = {
  profile: {
    id: 12345,
    username: 'testuser',
    email: 'test@example.com',
    displayName: 'Test User',
    joinDate: '2024-01-15T00:00:00Z',
    bio: 'This is a test user for data export testing'
  },
  privacySettings: {
    profileVisibility: 'public',
    emailNotifications: true,
    activityTracking: false,
    dataSharing: 'minimal'
  },
  readingHistory: [
    {
      postId: 1001,
      progress: 75,
      lastReadAt: '2024-03-20T15:32:45Z'
    },
    {
      postId: 1002,
      progress: 100,
      lastReadAt: '2024-03-18T09:12:30Z'
    },
    {
      postId: 1003,
      progress: 25,
      lastReadAt: '2024-03-15T21:05:10Z'
    }
  ],
  bookmarks: [
    {
      id: 501,
      postId: 1001,
      createdAt: '2024-03-10T08:45:22Z',
      tags: ['fantasy', 'adventure'],
      post: {
        title: 'The Hidden Kingdom'
      }
    },
    {
      id: 502,
      postId: 1005,
      createdAt: '2024-02-28T14:30:15Z',
      tags: ['mystery', 'thriller'],
      post: {
        title: 'Midnight Detective'
      }
    }
  ],
  comments: [
    {
      id: 2001,
      postId: 1001,
      content: 'This was a fantastic chapter! Looking forward to the next one.',
      createdAt: '2024-03-15T18:22:45Z'
    },
    {
      id: 2002,
      postId: 1002,
      content: 'I think there might be a plot hole here. What happened to the missing artifact?',
      createdAt: '2024-03-12T11:05:30Z'
    }
  ],
  activities: [
    {
      type: 'READ',
      action: 'completed',
      postId: 1002,
      timestamp: '2024-03-18T09:15:00Z',
      details: 'Completed reading "The Forgotten Path"'
    },
    {
      type: 'COMMENT',
      action: 'posted',
      postId: 1001,
      timestamp: '2024-03-15T18:23:00Z',
      commentId: 2001
    },
    {
      type: 'BOOKMARK',
      action: 'added',
      postId: 1005,
      timestamp: '2024-02-28T14:30:30Z',
      bookmarkId: 502
    }
  ]
};

// Run tests
async function runExportUtilsTests() {
  try {
    console.log('\x1b[33m==============================================\x1b[0m');
    console.log('\x1b[33m     TESTING DATA EXPORT UTILITIES\x1b[0m');
    console.log('\x1b[33m==============================================\x1b[0m');
    
    // Import the export utilities
    const exportUtils = await import('./client/src/utils/export-utils.js');
    
    console.log('\n\x1b[32m[TEST] Testing Text Export\x1b[0m');
    exportUtils.exportAsText(testUserData, 'test-export.txt');
    
    console.log('\n\x1b[32m[TEST] Testing CSV Export\x1b[0m');
    exportUtils.exportAsCSV(testUserData, 'test-export.csv');
    
    console.log('\n\x1b[32m[TEST] Testing JSON Export\x1b[0m');
    exportUtils.exportAsJSON(testUserData, 'test-export.json');
    
    console.log('\n\x1b[32m[TEST] Testing Print View\x1b[0m');
    exportUtils.printUserData(testUserData);
    
    console.log('\n\x1b[32m[TEST] Testing Error Handling in Text Export\x1b[0m');
    try {
      // Force an error by passing null
      exportUtils.exportAsText(null, 'error-test.txt');
    } catch (error) {
      console.log('[TEST] Successfully caught error:', error.message);
    }
    
    console.log('\n\x1b[33m==============================================\x1b[0m');
    console.log('\x1b[33m     ALL TESTS COMPLETED\x1b[0m');
    console.log('\x1b[33m==============================================\x1b[0m');
    
  } catch (error) {
    console.error('\x1b[31m[TEST FAILURE]\x1b[0m Error running tests:', error);
  }
}

runExportUtilsTests().catch(console.error);