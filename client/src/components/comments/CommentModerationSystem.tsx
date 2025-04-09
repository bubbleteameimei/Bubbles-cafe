import React, { useState, useEffect, useCallback } from 'react';
import Filter from 'bad-words';
import profanity from 'leo-profanity';
import { produce } from 'immer';
import { TypeAnimation } from 'react-type-animation';
import Modal from 'react-modal';
import { useSpeechSynthesis } from 'react-speech-kit';
import clsx from 'clsx';

// Initialize leo-profanity with default dictionary
profanity.loadDictionary();

// Initialize Modal
if (typeof window !== 'undefined') {
  Modal.setAppElement('#root');
}

interface Comment {
  id: string;
  author: string;
  content: string;
  date: Date;
  isModerated: boolean;
  isApproved: boolean;
  moderationNotes?: string;
}

export interface CommentModerationSystemProps {
  initialComments?: Comment[];
  onApproveComment?: (comment: Comment) => void;
  onRejectComment?: (comment: Comment) => void;
  customBadWords?: string[];
  filterLevel?: 'strict' | 'moderate' | 'lenient';
  showAITools?: boolean;
}

export function CommentModerationSystem({
  initialComments = [],
  onApproveComment,
  onRejectComment,
  customBadWords = [],
  filterLevel = 'moderate',
  showAITools = true
}: CommentModerationSystemProps) {
  // Initialize the profanity filter
  const [filter] = useState(() => {
    const badWordsFilter = new Filter();
    if (customBadWords.length > 0) {
      badWordsFilter.addWords(...customBadWords);
    }
    return badWordsFilter;
  });

  // State for comments
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [pendingComments, setPendingComments] = useState<Comment[]>([]);
  const [moderatedComments, setModeratedComments] = useState<Comment[]>([]);
  
  // State for form inputs
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  
  // State for moderation modal
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [moderationNote, setModerationNote] = useState('');
  
  // State for text-to-speech
  const { speak, cancel, voices } = useSpeechSynthesis();
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  // Initialize the voice
  useEffect(() => {
    if (voices.length > 0) {
      setSelectedVoice(voices[0]);
    }
  }, [voices]);

  // Filter comments into pending and moderated lists
  useEffect(() => {
    setPendingComments(comments.filter(comment => !comment.isModerated));
    setModeratedComments(comments.filter(comment => comment.isModerated));
  }, [comments]);

  // Function to check for profanity using multiple libraries for better coverage
  const containsProfanity = useCallback((text: string): boolean => {
    // Different levels of strictness
    if (filterLevel === 'strict') {
      return filter.isProfane(text) || profanity.check(text);
    } else if (filterLevel === 'moderate') {
      // Only flag if both libraries detect profanity
      return filter.isProfane(text) && profanity.check(text);
    } else {
      // Lenient - only flag obvious profanity
      const badWordCount = 
        text.split(' ')
          .filter(word => filter.isProfane(word) || profanity.check(word))
          .length;
      return badWordCount > 1; // Only flag if multiple bad words
    }
  }, [filter, filterLevel]);

  // Function to clean profanity
  const cleanText = useCallback((text: string): string => {
    // First use the bad-words library
    let cleaned = filter.clean(text);
    // Then use leo-profanity for additional cleaning
    cleaned = profanity.clean(cleaned);
    return cleaned;
  }, [filter]);

  // Function to add a new comment
  const handleAddComment = useCallback(() => {
    if (!newComment.trim() || !authorName.trim()) return;

    const newCommentObj: Comment = {
      id: Date.now().toString(),
      author: authorName,
      content: newComment,
      date: new Date(),
      isModerated: false,
      isApproved: false
    };

    // Auto-moderate if it contains profanity
    if (containsProfanity(newComment)) {
      newCommentObj.isModerated = true;
      newCommentObj.isApproved = false;
      newCommentObj.moderationNotes = 'Automatically rejected due to inappropriate language.';
    }

    setComments(prevComments => [...prevComments, newCommentObj]);
    setNewComment('');
  }, [newComment, authorName, containsProfanity]);

  // Function to open moderation modal
  const openModerationModal = useCallback((comment: Comment) => {
    setSelectedComment(comment);
    setModerationNote(comment.moderationNotes || '');
    setModalIsOpen(true);
  }, []);

  // Function to handle comment approval
  const handleApproveComment = useCallback(() => {
    if (!selectedComment) return;

    setComments(produce(draft => {
      const commentIndex = draft.findIndex(c => c.id === selectedComment.id);
      if (commentIndex !== -1) {
        draft[commentIndex].isModerated = true;
        draft[commentIndex].isApproved = true;
        draft[commentIndex].moderationNotes = moderationNote;
      }
    }));

    if (onApproveComment) {
      onApproveComment({
        ...selectedComment,
        isModerated: true,
        isApproved: true,
        moderationNotes: moderationNote
      });
    }

    setModalIsOpen(false);
  }, [selectedComment, moderationNote, onApproveComment]);

  // Function to handle comment rejection
  const handleRejectComment = useCallback(() => {
    if (!selectedComment) return;

    setComments(produce(draft => {
      const commentIndex = draft.findIndex(c => c.id === selectedComment.id);
      if (commentIndex !== -1) {
        draft[commentIndex].isModerated = true;
        draft[commentIndex].isApproved = false;
        draft[commentIndex].moderationNotes = moderationNote;
      }
    }));

    if (onRejectComment) {
      onRejectComment({
        ...selectedComment,
        isModerated: true,
        isApproved: false,
        moderationNotes: moderationNote
      });
    }

    setModalIsOpen(false);
  }, [selectedComment, moderationNote, onRejectComment]);

  // Function to handle reading the comment aloud
  const handleReadComment = useCallback(() => {
    if (!selectedComment) return;

    if (selectedVoice) {
      speak({ 
        text: selectedComment.content, 
        voice: selectedVoice,
        rate: 1.0,
        pitch: 1.0
      });
    }
  }, [selectedComment, selectedVoice, speak]);

  // Function to check for potential issues
  const analyzePotentialIssues = useCallback((comment: Comment): string[] => {
    const issues: string[] = [];
    
    // Check for profanity
    if (containsProfanity(comment.content)) {
      issues.push('Contains inappropriate language');
    }
    
    // Check for spam indicators
    if (comment.content.includes('http') || comment.content.includes('www.')) {
      issues.push('Contains links (potential spam)');
    }
    
    // Check for ALL CAPS (shouting)
    if (comment.content.toUpperCase() === comment.content && comment.content.length > 10) {
      issues.push('Excessive use of capital letters');
    }
    
    // Check for very short comments
    if (comment.content.length < 5) {
      issues.push('Very short comment (low value)');
    }
    
    return issues;
  }, [containsProfanity]);

  return (
    <div className="bg-background p-6 rounded-lg border">
      <h2 className="text-2xl font-bold mb-6">Comment Moderation System</h2>

      {/* Comment Form */}
      <div className="mb-8 p-4 bg-muted rounded-md">
        <h3 className="text-lg font-medium mb-4">Add New Comment</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="author" className="block text-sm font-medium mb-1">
              Name
            </label>
            <input
              type="text"
              id="author"
              value={authorName}
              onChange={e => setAuthorName(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="comment" className="block text-sm font-medium mb-1">
              Comment
            </label>
            <textarea
              id="comment"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
              placeholder="Write your comment here..."
            />
          </div>
          <div className="text-right">
            <button
              onClick={handleAddComment}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Submit Comment
            </button>
          </div>
        </div>
      </div>

      {/* Pending Comments */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Pending Comments ({pendingComments.length})</h3>
        {pendingComments.length === 0 ? (
          <p className="text-muted-foreground italic">No pending comments to moderate.</p>
        ) : (
          <div className="space-y-4">
            {pendingComments.map(comment => (
              <div key={comment.id} className="p-4 border rounded-md bg-card">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{comment.author}</span>
                  <span className="text-sm text-muted-foreground">
                    {comment.date.toLocaleString()}
                  </span>
                </div>
                <p className="mb-4">{comment.content}</p>
                
                {/* Potential issues */}
                {analyzePotentialIssues(comment).length > 0 && (
                  <div className="mb-3 p-2 bg-destructive/10 text-destructive rounded text-sm">
                    <strong>Potential issues:</strong>
                    <ul className="list-disc pl-5 mt-1">
                      {analyzePotentialIssues(comment).map((issue, i) => (
                        <li key={i}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => openModerationModal(comment)}
                    className="px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  >
                    Moderate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Moderated Comments */}
      <div>
        <h3 className="text-lg font-medium mb-4">Moderated Comments ({moderatedComments.length})</h3>
        {moderatedComments.length === 0 ? (
          <p className="text-muted-foreground italic">No moderated comments yet.</p>
        ) : (
          <div className="space-y-4">
            {moderatedComments.map(comment => (
              <div 
                key={comment.id} 
                className={clsx("p-4 border rounded-md", {
                  "bg-green-50 dark:bg-green-900/20": comment.isApproved,
                  "bg-red-50 dark:bg-red-900/20": !comment.isApproved
                })}
              >
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{comment.author}</span>
                  <span className={clsx("px-2 py-0.5 rounded text-xs", {
                    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100": comment.isApproved,
                    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100": !comment.isApproved
                  })}>
                    {comment.isApproved ? 'Approved' : 'Rejected'}
                  </span>
                </div>
                <p className="mb-2">{comment.content}</p>
                {comment.moderationNotes && (
                  <div className="text-sm text-muted-foreground mt-2">
                    <strong>Moderation notes:</strong> {comment.moderationNotes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Moderation Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background p-6 rounded-lg border shadow-lg w-full max-w-xl"
        overlayClassName="fixed inset-0 bg-black/50"
      >
        {selectedComment && (
          <div>
            <h2 className="text-xl font-bold mb-4">Moderate Comment</h2>
            
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="font-medium">{selectedComment.author}</span>
                <span className="text-sm text-muted-foreground">
                  {selectedComment.date.toLocaleString()}
                </span>
              </div>
              <div className="p-4 bg-muted rounded-md mb-4">
                <p>{selectedComment.content}</p>
              </div>
              
              {/* Cleaned preview */}
              {containsProfanity(selectedComment.content) && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Clean version:</h3>
                  <div className="p-4 bg-muted rounded-md">
                    <p>{cleanText(selectedComment.content)}</p>
                  </div>
                </div>
              )}
              
              {/* AI Tools Section */}
              {showAITools && (
                <div className="mb-4 p-4 border rounded-md bg-card">
                  <h3 className="text-sm font-bold mb-2">AI Analysis</h3>
                  
                  <div className="mb-3">
                    <TypeAnimation
                      sequence={[
                        'Analyzing comment for potential issues...',
                        1000,
                        () => {
                          // Analysis complete callback
                        }
                      ]}
                      wrapper="p"
                      cursor={true}
                      className="text-sm text-muted-foreground mb-2"
                    />
                    
                    {analyzePotentialIssues(selectedComment).length > 0 ? (
                      <ul className="list-disc pl-5 text-sm">
                        {analyzePotentialIssues(selectedComment).map((issue, i) => (
                          <li key={i} className="text-destructive">{issue}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-green-600">No issues detected</p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={handleReadComment}
                      className="px-3 py-1 bg-muted text-muted-foreground rounded border hover:bg-muted/80 text-sm"
                    >
                      Read Aloud
                    </button>
                    <select 
                      className="px-3 py-1 bg-muted text-muted-foreground rounded border hover:bg-muted/80 text-sm"
                      value={selectedVoice ? voices.indexOf(selectedVoice) : 0}
                      onChange={(e) => setSelectedVoice(voices[parseInt(e.target.value)])}
                    >
                      {voices.map((voice, index) => (
                        <option key={index} value={index}>
                          {voice.name} ({voice.lang})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => cancel()}
                      className="px-3 py-1 bg-muted text-muted-foreground rounded border hover:bg-muted/80 text-sm"
                    >
                      Stop
                    </button>
                  </div>
                </div>
              )}
              
              {/* Moderation Notes */}
              <div className="mb-4">
                <label htmlFor="moderation-notes" className="block text-sm font-medium mb-1">
                  Moderation Notes
                </label>
                <textarea
                  id="moderation-notes"
                  value={moderationNote}
                  onChange={e => setModerationNote(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
                  placeholder="Add notes about this moderation decision..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setModalIsOpen(false)}
                className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectComment}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
              >
                Reject
              </button>
              <button
                onClick={handleApproveComment}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Approve
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}