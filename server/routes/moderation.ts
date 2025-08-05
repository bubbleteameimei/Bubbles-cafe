import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

// Get reported content
router.get('/reported-content', async (_req, res) => {
  try {
    const reportedContent = await storage.getReportedContent();
    return res.json(reportedContent);
  } catch (error) {
    console.error('[Moderation] Error getting reported content:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update reported content status
router.patch('/reported-content/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updatedContent = await storage.updateReportedContent(parseInt(id), status);
    
    if (!updatedContent) {
      return res.status(404).json({ error: 'Content not found' });
    }

    return res.json(updatedContent);
  } catch (error) {
    console.error('[Moderation] Error updating reported content:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Report content
router.post('/report', async (req, res) => {
  try {
    const report = req.body;
    
    if (!report.content || !report.reason) {
      return res.status(400).json({ error: 'Content and reason are required' });
    }

    const newReport = await storage.reportContent(report);
    return res.status(201).json(newReport);
  } catch (error) {
    console.error('[Moderation] Error reporting content:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Create comment reply
router.post('/comments/:commentId/replies', async (req, res) => {
  try {
    const { commentId } = req.params;
    const replyData = req.body;

    if (!replyData.content) {
      return res.status(400).json({ error: 'Reply content is required' });
    }

    const reply = await storage.createCommentReply({
      ...replyData,
      parentCommentId: parseInt(commentId)
    });

    return res.status(201).json(reply);
  } catch (error) {
    console.error('[Moderation] Error creating reply:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;