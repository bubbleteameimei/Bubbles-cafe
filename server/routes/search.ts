import { Router } from 'express';
import { db } from '../db';
import { 
  posts, 
  comments, 
  users,
  reportedContent
} from '@shared/schema';
import { eq, like, or, ilike, and, desc, asc } from 'drizzle-orm';

// Define types for search use
type Post = typeof posts.$inferSelect;
type Comment = typeof comments.$inferSelect;
type User = typeof users.$inferSelect;
type ReportedContent = typeof reportedContent.$inferSelect;

const router = Router();

// Search content types interface
interface SearchOptions {
  includePages: boolean;
  includeComments: boolean;
  includeUsers: boolean;
  includeReported: boolean;
  includeLegal: boolean;
  includeSettings: boolean;
  contentTypes: string[];
  limit: number;
  isAdmin: boolean;
}

// Search API endpoint with expanded capabilities
router.get('/', async (req, res) => {
  try {
    // Default to searching all non-admin content
    const { 
      q, 
      types = 'posts,pages,comments,legal,settings', 
      limit = '20',
      admin = 'false'
    } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Convert query to lowercase for case-insensitive search
    const searchQuery = q.toLowerCase();
    const searchTerms = searchQuery.split(' ').filter(term => term.length > 2);

    if (searchTerms.length === 0) {
      return res.status(400).json({ 
        error: 'Search query must contain at least one term with 3 or more characters',
        results: []
      });
    }

    // Parse content type filters
    const contentTypes = typeof types === 'string' ? types.split(',') : ['posts'];
    
    // Parse and validate numeric limit
    const resultLimit = Math.min(
      Math.max(parseInt(limit as string, 10) || 20, 1), 
      50
    ); // Between 1 and 50
    
    // Check if user is admin (for admin-only content)
    // This would normally check session, here we're just using a query param for demo
    const isAdmin = req.session?.user?.isAdmin || (admin === 'true');
    
    // Configure search options
    const searchOptions: SearchOptions = {
      includePages: contentTypes.includes('pages'),
      includeComments: contentTypes.includes('comments'),
      includeUsers: contentTypes.includes('users') && isAdmin, // Only admins can search users
      includeReported: contentTypes.includes('reported') && isAdmin, // Only admins can search reported content
      includeLegal: contentTypes.includes('legal'),
      includeSettings: contentTypes.includes('settings'),
      contentTypes,
      limit: resultLimit,
      isAdmin
    };

    console.log(`[Search] Searching for: "${searchQuery}" with terms:`, searchTerms);
    console.log(`[Search] Options:`, searchOptions);

    // Initialize results array 
    let results: any[] = [];
    
    // 1. Search posts (always included)
    if (contentTypes.includes('posts')) {
      const allPosts = await db.select().from(posts);
      
      const postResults = allPosts
        .filter((post: Post) => {
          const title = post.title?.toLowerCase() || '';
          const content = post.content?.toLowerCase() || '';
  
          // Check if ANY search term appears in title or content
          return searchTerms.some(term => {
            return title.includes(term) || content.includes(term);
          });
        })
        .map((post: Post) => {
          const title = post.title || '';
          const content = post.content || '';
          
          // Strip HTML tags to get plain text content
          const plainContent = content.replace(/<[^>]+>/g, '');
          
          // Find matches with context
          const matches: { text: string; context: string }[] = [];
  
          searchTerms.forEach(term => {
            // Extract sentences containing the search term (rough heuristic)
            const regex = new RegExp(`[^.!?]*(?<=[.!?\\s]|^)${term}(?=[\\s.!?]|$)[^.!?]*[.!?]`, 'gi');
            const contextMatches = plainContent.match(regex);
            
            if (contextMatches && contextMatches.length > 0) {
              // Take the first 3 context matches per term
              contextMatches.slice(0, 3).forEach((context: string) => {
                matches.push({
                  text: term,
                  context: context.trim()
                });
              });
            } else {
              // If no clear sentence found, get some surrounding context
              const index = plainContent.toLowerCase().indexOf(term);
              if (index !== -1) {
                const start = Math.max(0, index - 60);
                const end = Math.min(plainContent.length, index + term.length + 60);
                matches.push({
                  text: term,
                  context: plainContent.substring(start, end).trim()
                });
              }
            }
          });
          
          // Get a summary excerpt
          let excerpt = '';
          if (matches.length > 0) {
            excerpt = matches[0].context;
          } else {
            excerpt = plainContent.substring(0, 150) + '...';
          }
          
          return {
            id: post.id,
            title: post.title,
            excerpt,
            type: 'post',
            url: `/reader/${post.id}`,
            matches,
            createdAt: post.createdAt
          };
        });
        
      results = [...results, ...postResults];
    }
    
    // 2. Search pages if requested
    if (searchOptions.includePages) {
      try {
        // Since we don't have a separate pages table, we'll treat certain posts as pages
        // We'll assume posts with special flags like isSecret might be treated as pages
        const allPosts = await db.select().from(posts);
        
        // Filter posts that seem like pages
        const pagePosts = allPosts.filter((post: Post) => post.isSecret === true);
        
        const pageResults = pagePosts
          .filter((post: Post) => {
            const title = post.title?.toLowerCase() || '';
            const content = post.content?.toLowerCase() || '';
            
            return searchTerms.some(term => {
              return title.includes(term) || content.includes(term);
            });
          })
          .map((post: Post) => {
            const title = post.title || '';
            const content = post.content || '';
            
            // Strip HTML tags
            const plainContent = content.replace(/<[^>]+>/g, '');
            
            // Find matches with context
            const matches: { text: string; context: string }[] = [];
            
            searchTerms.forEach(term => {
              // Extract sentences containing the search term
              const regex = new RegExp(`[^.!?]*(?<=[.!?\\s]|^)${term}(?=[\\s.!?]|$)[^.!?]*[.!?]`, 'gi');
              const contextMatches = plainContent.match(regex);
              
              if (contextMatches && contextMatches.length > 0) {
                contextMatches.slice(0, 2).forEach((context: string) => {
                  matches.push({
                    text: term,
                    context: context.trim()
                  });
                });
              } else {
                const index = plainContent.toLowerCase().indexOf(term);
                if (index !== -1) {
                  const start = Math.max(0, index - 60);
                  const end = Math.min(plainContent.length, index + term.length + 60);
                  matches.push({
                    text: term,
                    context: plainContent.substring(start, end).trim()
                  });
                }
              }
            });
            
            // Get summary
            let excerpt = '';
            if (matches.length > 0) {
              excerpt = matches[0].context;
            } else {
              excerpt = plainContent.substring(0, 150) + '...';
            }
            
            return {
              id: post.id,
              title: post.title,
              excerpt,
              type: 'page',
              url: `/page/${post.slug}`,
              matches,
              createdAt: post.createdAt
            };
          });
          
        results = [...results, ...pageResults];
      } catch (err) {
        console.error('[Search] Error searching pages:', err);
      }
    }
    
    // 3. Search comments if requested
    if (searchOptions.includeComments) {
      try {
        const allComments = await db.select().from(comments);
        
        const commentResults = allComments
          .filter((comment: Comment) => {
            const content = comment.content?.toLowerCase() || '';
            
            return searchTerms.some(term => content.includes(term));
          })
          .map((comment: Comment) => {
            const content = comment.content || '';
            
            // Strip HTML tags
            const plainContent = content.replace(/<[^>]+>/g, '');
            
            // Find matches with context
            const matches: { text: string; context: string }[] = [];
            
            searchTerms.forEach(term => {
              const index = plainContent.toLowerCase().indexOf(term);
              if (index !== -1) {
                const start = Math.max(0, index - 60);
                const end = Math.min(plainContent.length, index + term.length + 60);
                matches.push({
                  text: term,
                  context: plainContent.substring(start, end).trim()
                });
              }
            });
            
            // Get summary
            let excerpt = plainContent.substring(0, 150) + '...';
            
            return {
              id: comment.id,
              title: `Comment on post #${comment.postId}`,
              excerpt,
              type: 'comment',
              url: `/reader/${comment.postId}#comment-${comment.id}`,
              matches,
              createdAt: comment.createdAt,
              postId: comment.postId,
              userId: comment.userId
            };
          });
          
        results = [...results, ...commentResults];
      } catch (err) {
        console.error('[Search] Error searching comments:', err);
      }
    }
    
    // 4. Search users if requested (admin only)
    if (searchOptions.includeUsers && searchOptions.isAdmin) {
      try {
        const allUsers = await db.select().from(users);
        
        const userResults = allUsers
          .filter((user: User) => {
            const username = user.username?.toLowerCase() || '';
            const email = user.email?.toLowerCase() || '';
            
            return searchTerms.some(term => {
              return username.includes(term) || (email && email.includes(term));
            });
          })
          .map((user: User) => {
            // For users, we create matches differently
            const matches: { text: string; context: string }[] = [];
            
            searchTerms.forEach(term => {
              const username = user.username?.toLowerCase() || '';
              const email = user.email?.toLowerCase() || '';
              
              if (username.includes(term)) {
                matches.push({
                  text: term,
                  context: `Username: ${user.username}`
                });
              }
              
              if (email && email.includes(term)) {
                matches.push({
                  text: term,
                  context: `Email: ${user.email}`
                });
              }
            });
            
            return {
              id: user.id,
              title: user.username,
              excerpt: `User ID: ${user.id}, Joined: ${new Date(user.createdAt || Date.now()).toLocaleDateString()}`,
              type: 'user',
              url: `/admin/users/${user.id}`,
              matches,
              createdAt: user.createdAt,
              adminOnly: true
            };
          });
          
        results = [...results, ...userResults];
      } catch (err) {
        console.error('[Search] Error searching users:', err);
      }
    }
    
    // 5. Search legal pages if requested
    if (searchOptions.includeLegal) {
      try {
        // Define static legal pages content to search
        const legalPages = [
          {
            id: 'privacy-policy',
            title: 'Privacy Policy',
            content: `Our Privacy Policy outlines how we collect, use, and protect your personal information. 
                     We respect your privacy and are committed to maintaining the confidentiality of your data. 
                     This policy explains your rights regarding your information and how you can exercise those rights.`,
            url: '/legal/privacy'
          },
          {
            id: 'terms-of-service',
            title: 'Terms of Service',
            content: `These Terms of Service govern your use of our platform and services. 
                     By accessing or using our platform, you agree to be bound by these terms. 
                     If you disagree with any part of the terms, you may not access our services.`,
            url: '/legal/terms'
          },
          {
            id: 'cookie-policy',
            title: 'Cookie Policy',
            content: `Our Cookie Policy explains how we use cookies and similar technologies on our website. 
                     Cookies help us improve your browsing experience, analyze site traffic, and personalize content. 
                     You can manage your cookie preferences through your browser settings.`,
            url: '/legal/cookies'
          },
          {
            id: 'copyright',
            title: 'Copyright Information',
            content: `All content on this platform, including stories, images, and design elements, is subject to copyright protection. 
                     Unauthorized reproduction or distribution is prohibited. 
                     For inquiries about using our content, please contact our copyright department.`,
            url: '/legal/copyright'
          }
        ];
        
        const legalResults = legalPages
          .filter(page => {
            const title = page.title.toLowerCase();
            const content = page.content.toLowerCase();
            
            return searchTerms.some(term => {
              return title.includes(term) || content.includes(term);
            });
          })
          .map(page => {
            // Find matches with context
            const matches: { text: string; context: string }[] = [];
            
            searchTerms.forEach(term => {
              const content = page.content.toLowerCase();
              const index = content.indexOf(term);
              
              if (index !== -1) {
                const start = Math.max(0, index - 60);
                const end = Math.min(content.length, index + term.length + 60);
                matches.push({
                  text: term,
                  context: page.content.substring(start, end).trim()
                });
              }
            });
            
            // Get summary
            let excerpt = '';
            if (matches.length > 0) {
              excerpt = matches[0].context;
            } else {
              excerpt = page.content.substring(0, 150) + '...';
            }
            
            return {
              id: page.id,
              title: page.title,
              excerpt,
              type: 'legal',
              url: page.url,
              matches,
              createdAt: new Date().toISOString() // Use current date since these are static pages
            };
          });
          
        results = [...results, ...legalResults];
      } catch (err) {
        console.error('[Search] Error searching legal pages:', err);
      }
    }
    
    // 6. Search settings pages if requested
    if (searchOptions.includeSettings) {
      try {
        // Define static settings pages content to search
        const settingsPages = [
          {
            id: 'account-settings',
            title: 'Account Settings',
            content: `Manage your account preferences, update your profile information, and control your privacy settings. 
                     You can change your username, email, and password from this page. 
                     Profile visibility and notification preferences can also be adjusted here.`,
            url: '/settings/account'
          },
          {
            id: 'notification-settings',
            title: 'Notification Settings',
            content: `Control which notifications you receive and how they are delivered. 
                     You can choose to be notified about new stories, comments on your posts, and system updates. 
                     Email notification frequency can be adjusted to daily, weekly, or disabled entirely.`,
            url: '/settings/notifications'
          },
          {
            id: 'display-settings',
            title: 'Display Settings',
            content: `Customize your reading experience with display preferences. 
                     Adjust font size, line spacing, and color themes for comfortable reading. 
                     Dark mode and contrast settings are available for reduced eye strain during nighttime reading.`,
            url: '/settings/display'
          },
          {
            id: 'security-settings',
            title: 'Security Settings',
            content: `Enhance your account security with additional protection measures. 
                     Enable two-factor authentication for an extra layer of security. 
                     Review active sessions and sign out from other devices if needed.`,
            url: '/settings/security'
          }
        ];
        
        const settingsResults = settingsPages
          .filter(page => {
            const title = page.title.toLowerCase();
            const content = page.content.toLowerCase();
            
            return searchTerms.some(term => {
              return title.includes(term) || content.includes(term);
            });
          })
          .map(page => {
            // Find matches with context
            const matches: { text: string; context: string }[] = [];
            
            searchTerms.forEach(term => {
              const content = page.content.toLowerCase();
              const index = content.indexOf(term);
              
              if (index !== -1) {
                const start = Math.max(0, index - 60);
                const end = Math.min(content.length, index + term.length + 60);
                matches.push({
                  text: term,
                  context: page.content.substring(start, end).trim()
                });
              }
            });
            
            // Get summary
            let excerpt = '';
            if (matches.length > 0) {
              excerpt = matches[0].context;
            } else {
              excerpt = page.content.substring(0, 150) + '...';
            }
            
            return {
              id: page.id,
              title: page.title,
              excerpt,
              type: 'settings',
              url: page.url,
              matches,
              createdAt: new Date().toISOString() // Use current date since these are static pages
            };
          });
          
        results = [...results, ...settingsResults];
      } catch (err) {
        console.error('[Search] Error searching settings pages:', err);
      }
    }
    
    // 7. Search reported content if requested (admin only)
    if (searchOptions.includeReported && searchOptions.isAdmin) {
      try {
        const allReported = await db.select().from(reportedContent);
        
        const reportedResults = allReported
          .filter((report: ReportedContent) => {
            const reason = report.reason?.toLowerCase() || '';
            // Use status as additional searchable field since we don't have details
            const status = report.status?.toLowerCase() || '';
            
            return searchTerms.some(term => {
              return reason.includes(term) || status.includes(term);
            });
          })
          .map((report: ReportedContent) => {
            // Create matches
            const matches: { text: string; context: string }[] = [];
            
            searchTerms.forEach(term => {
              const reason = report.reason?.toLowerCase() || '';
              const status = report.status?.toLowerCase() || '';
              
              if (reason.includes(term)) {
                matches.push({
                  text: term,
                  context: `Reason: ${report.reason}`
                });
              }
              
              if (status.includes(term)) {
                matches.push({
                  text: term,
                  context: `Status: ${report.status}`
                });
              }
            });
            
            // Pick correct URL based on content type
            let url = '/admin/reports';
            if (report.contentType === 'post') {
              url = `/reader/${report.contentId}`;
            } else if (report.contentType === 'comment') {
              // For comments, we need to find the related post - for now use a generic URL
              url = `/admin/reports/${report.id}`;
            }
            
            return {
              id: report.id,
              title: `Reported ${report.contentType} #${report.contentId}`,
              excerpt: report.reason || 'No reason provided',
              type: 'report',
              url,
              matches,
              createdAt: report.createdAt,
              adminOnly: true
            };
          });
          
        results = [...results, ...reportedResults];
      } catch (err) {
        console.error('[Search] Error searching reported content:', err);
      }
    }
    
    // Sort results by relevance (match count) and then date
    results.sort((a, b) => {
      // First by match count (higher first)
      const matchDiff = b.matches.length - a.matches.length;
      if (matchDiff !== 0) return matchDiff;
      
      // Then by date (newer first) if matches are equal
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
    
    // Limit results
    results = results.slice(0, searchOptions.limit);

    console.log(`[Search] Found ${results.length} results for "${searchQuery}"`);
    return res.json({ 
      results,
      meta: {
        query: searchQuery,
        total: results.length,
        types: contentTypes,
        isAdmin: searchOptions.isAdmin
      } 
    });
    
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ error: 'An error occurred during search', results: [] });
  }
});

export default router;