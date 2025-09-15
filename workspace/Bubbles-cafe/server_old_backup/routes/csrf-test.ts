/**
 * CSRF Test Routes
 * 
 * These routes are used to test the CSRF protection implementation.
 */

import express from 'express';
import { validateCsrfToken } from '../middleware/csrf-protection';

const router = express.Router();

// Public GET endpoint - should be accessible without CSRF protection
router.get('/csrf-test', (req, res) => {
  res.json({
    message: 'GET endpoint successful - no CSRF protection needed',
    success: true,
    session: Boolean(req.session),
    csrfToken: req.session.csrfToken ? req.session.csrfToken.substr(0, 8) + '...' : null
  });
});

// Protected POST endpoint - requires CSRF protection
router.post('/csrf-test', validateCsrfToken(), (req, res) => {
  res.json({
    message: 'POST endpoint successful - CSRF protection passed',
    success: true,
    receivedToken: req.headers['x-csrf-token'] ? String(req.headers['x-csrf-token']).substr(0, 8) + '...' : null,
    sessionToken: req.session.csrfToken ? req.session.csrfToken.substr(0, 8) + '...' : null
  });
});

// Another protected endpoint but with protection disabled (for testing)
router.post('/csrf-test-bypass', (req, res) => {
  res.json({
    message: 'POST endpoint successful - CSRF protection bypassed',
    success: true,
    sessionToken: req.session.csrfToken ? req.session.csrfToken.substr(0, 8) + '...' : null
  });
});

export default router;