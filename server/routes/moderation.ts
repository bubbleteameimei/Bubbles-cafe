import { Router } from 'express';
import { storage } from '../storage';
import { moderateComment } from '../utils/comment-moderation';
import { z } from 'zod';

const router = Router();

// Get all reported content
router.get('/reported-content', async (req, res) => {
  try {
    const reportedContent = await storage.getReportedContent();
    return res.json(reportedContent);
  } catch (error) {
    console.error('Error fetching reported content:', error);
    return res.status(500).json({ error: 'Failed to fetch reported content' });
  }
});

// Update reported content status
router.patch('/reported-content/:id', async (req, res) => {
  try {
    const schema = z.object({
      status: z.enum(['approved', 'rejected'])
    });

    const { status } = schema.parse(req.body);
    const id = parseInt(req.params.id);
    
    // Validate that id is a valid number
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid ID parameter' });
    }

    // Update the content status
    const updatedContent = await storage.updateReportedContent(id, status);
    return res.json(updatedContent);
  } catch (error) {
    console.error('Error updating reported content:', error);
    return res.status(500).json({ error: 'Failed to update content status' });
  }
});

// Report new content
router.post('/report', async (req, res) => {
  try {
    const schema = z.object({
      contentType: z.string(),
      contentId: z.number(),
      reason: z.string(),
      reporterId: z.number()
    });

    const report = schema.parse(req.body);
    const newReport = await storage.reportContent(report);
    return res.status(201).json(newReport);
  } catch (error) {
    console.error('Error creating content report:', error);
    return res.status(500).json({ error: 'Failed to create content report' });
  }
});

// Add reply to a comment
router.post('/comments/:commentId/replies', async (req, res) => {
  try {
    const schema = z.object({
      content: z.string().min(1, "Reply content is required"),
      author: z.string().min(1, "Author name is required")
    });

    const { content, author } = schema.parse(req.body);
    const commentId = parseInt(req.params.commentId);
    
    // Validate that commentId is a valid number
    if (isNaN(commentId) || commentId <= 0) {
      return res.status(400).json({ error: 'Invalid comment ID parameter' });
    }

    const reply = await storage.createCommentReply({
      content,
      postId: null,
      parentId: commentId,
      userId: req.user?.id || null,
      metadata: {
        author: author || 'Anonymous',
        isAnonymous: !req.user?.id,
        moderated: false,
        originalContent: content,
        upvotes: 0,
        downvotes: 0
      },
      is_approved: true
    });

    return res.status(201).json(reply);
  } catch (error) {
    console.error('Error creating comment reply:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid reply data",
        errors: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      });
    }
    return res.status(500).json({ error: 'Failed to create reply' });
  }
});

export default router;