import React, { useState } from 'react';
import { CommentModerationSystem } from '@/components/comments/CommentModerationSystem';

// Sample custom bad words for demonstration
const CUSTOM_BAD_WORDS = [
  'badword',
  'inappropriate',
  'offensive'
];

// Sample initial comments
const INITIAL_COMMENTS = [
  {
    id: '1',
    author: 'John Doe',
    content: 'This is a great article! I learned a lot from it.',
    date: new Date(Date.now() - 86400000), // 1 day ago
    isModerated: false,
    isApproved: false
  },
  {
    id: '2',
    author: 'Jane Smith',
    content: 'I disagree with some points in the article, but overall it was well-written.',
    date: new Date(Date.now() - 43200000), // 12 hours ago
    isModerated: false,
    isApproved: false
  },
  {
    id: '3',
    author: 'Angry User',
    content: 'This article is terrible and the author clearly doesn\'t know what they\'re talking about! GARBAGE CONTENT!!',
    date: new Date(Date.now() - 21600000), // 6 hours ago
    isModerated: false,
    isApproved: false
  },
  {
    id: '4',
    author: 'Spam Bot',
    content: 'Check out my website at www.totally-not-spam.com for amazing deals!',
    date: new Date(Date.now() - 7200000), // 2 hours ago
    isModerated: false,
    isApproved: false
  }
];

export default function CommentModerationDemo() {
  const [filterLevel, setFilterLevel] = useState<'strict' | 'moderate' | 'lenient'>('moderate');
  const [showAITools, setShowAITools] = useState(true);
  
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Comment Moderation System Demo</h1>
      
      <div className="max-w-4xl mx-auto mb-10">
        <div className="bg-card p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Profanity Filter Level</label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    name="filter-level"
                    value="strict"
                    checked={filterLevel === 'strict'}
                    onChange={() => setFilterLevel('strict')}
                  />
                  <span className="ml-2">Strict</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    name="filter-level"
                    value="moderate"
                    checked={filterLevel === 'moderate'}
                    onChange={() => setFilterLevel('moderate')}
                  />
                  <span className="ml-2">Moderate</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    name="filter-level"
                    value="lenient"
                    checked={filterLevel === 'lenient'}
                    onChange={() => setFilterLevel('lenient')}
                  />
                  <span className="ml-2">Lenient</span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={showAITools}
                  onChange={() => setShowAITools(!showAITools)}
                />
                <span className="ml-2">Show AI Tools</span>
              </label>
            </div>
          </div>
        </div>
        
        <CommentModerationSystem
          initialComments={INITIAL_COMMENTS}
          customBadWords={CUSTOM_BAD_WORDS}
          filterLevel={filterLevel}
          showAITools={showAITools}
          onApproveComment={(comment) => {
            console.log('Comment approved:', comment);
          }}
          onRejectComment={(comment) => {
            console.log('Comment rejected:', comment);
          }}
        />
      </div>
      
      <div className="max-w-3xl mx-auto mt-12">
        <div className="bg-card p-6 rounded-lg shadow-sm border-t-4 border-primary">
          <h2 className="text-2xl font-semibold mb-4">Implementation Notes</h2>
          <p className="mb-4">
            This demo showcases a comment moderation system with the following features:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Profanity Filtering</strong> - Uses both <code>bad-words</code> and <code>leo-profanity</code> libraries for better coverage
            </li>
            <li>
              <strong>Configurable Filter Levels</strong> - Choose between strict, moderate, and lenient filtering
            </li>
            <li>
              <strong>Automatic Moderation</strong> - Automatically flags comments with inappropriate content
            </li>
            <li>
              <strong>AI Analysis Tools</strong> - Detects potential issues like spam, shouting, and low-value comments
            </li>
            <li>
              <strong>Text-to-Speech</strong> - Uses Web Speech API via <code>react-speech-kit</code> to read comments aloud
            </li>
            <li>
              <strong>Immutable State Management</strong> - Uses <code>immer</code> for simplified state updates
            </li>
            <li>
              <strong>Animated UI</strong> - Incorporates <code>react-type-animation</code> for typing effects
            </li>
            <li>
              <strong>Modal Dialogs</strong> - Uses <code>react-modal</code> for accessible moderation interfaces
            </li>
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            This system can be integrated with any existing comment section to provide moderation capabilities.
            It's highly customizable and can be adapted to different content policies and guidelines.
          </p>
        </div>
      </div>
    </div>
  );
}