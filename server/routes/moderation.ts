import { Router } from 'express';
import { storage } from '../storage';
import { moderateComment } from '../utils/comment-moderation';
import { z } from 'zod';

const router = Router();

// Get all reported content
router.get('/reported-content', async (req, res) => {
  try {
    const reportedContent = await storage.getReportedContent();
    res.json(reportedContent);
  } catch (error) {
    console.error('Error fetching reported content:', error);
    res.status(500).json({ error: 'Failed to fetch reported content' });
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
    
    // Update the content status
    const updatedContent = await storage.updateReportedContent(id, status);
    res.json(updatedContent);
  } catch (error) {
    console.error('Error updating reported content:', error);
    res.status(500).json({ error: 'Failed to update content status' });
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
    res.status(201).json(newReport);
  } catch (error) {
    console.error('Error creating content report:', error);
    res.status(500).json({ error: 'Failed to create content report' });
  }
});

export default router;
