import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { createTransport } from "nodemailer";

// Configure nodemailer with secure settings
const transporter = createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'vantalison@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD?.trim()
  },
  connectionTimeout: 5000, // 5 seconds
  greetingTimeout: 5000,
  socketTimeout: 5000,
  debug: true,
  logger: true, // Enable built-in logger
  tls: {
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2'
  },
  pool: true,
  maxConnections: 1,
  maxMessages: 100,
  rateDelta: 1000,
  rateLimit: 3
});

// Verify transporter connection on startup with detailed error logging
const verifyEmailConfig = async () => {
  try {
    console.log('Attempting to verify email configuration...');
    console.log('Environment check:', {
      hasAppPassword: !!process.env.GMAIL_APP_PASSWORD,
      appPasswordLength: process.env.GMAIL_APP_PASSWORD?.length
    });

    const verified = await transporter.verify();
    console.log('Email transporter verification successful:', verified);
    return verified;
  } catch (error: any) {
    console.error('Email transporter verification failed with error:', {
      message: error.message,
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
      response: error.response,
      authMethod: error.authMethod
    });

    if (error.code === 'EAUTH') {
      console.error('Authentication failed. Please check the Gmail app password.');
    } else if (error.code === 'ESOCKET') {
      console.error('Socket error. Please check network connectivity.');
    }

    return false;
  }
};

// Verify email configuration immediately
verifyEmailConfig().then(verified => {
  if (verified) {
    console.log('Email system ready to send messages');
  } else {
    console.log('Email system not properly configured');
  }
});

// Admin middleware - uses passport's authentication
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user?.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized: Please log in again" });
  }
};

export function registerRoutes(app: Express): Server {
  // Set up authentication routes and middleware
  setupAuth(app);

  // Admin-specific routes
  app.get("/api/admin/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized: Please log in again" });
    }
    res.json({ isAdmin: req.user.isAdmin });
  });

  // Protected admin routes
  app.patch("/api/posts/:id", isAuthenticated, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const updatedPost = await storage.updatePost(postId, req.body);
      res.json(updatedPost);
    } catch (error) {
      console.error("Error updating post:", error);
      res.status(500).json({ message: "Failed to update post" });
    }
  });

  app.post("/api/posts", isAuthenticated, async (req, res) => {
    try {
      const post = await storage.createPost(req.body);
      res.json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.delete("/api/posts/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deletePost(parseInt(req.params.id));
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // Public routes
  app.get("/api/posts", async (_req, res) => {
    try {
      const posts = await storage.getPosts();
      const uniquePosts = Array.from(new Map(posts.map(post => [post.id, post])).values());
      res.json(uniquePosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.get("/api/posts/secret", async (_req, res) => {
    try {
      const posts = await storage.getSecretPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching secret posts:", error);
      res.status(500).json({ message: "Failed to fetch secret posts" });
    }
  });

  app.post("/api/posts/secret/:postId/unlock", async (req, res) => {
    try {
      const progress = await storage.unlockSecretPost({
        postId: parseInt(req.params.postId),
        unlockedBy: req.body.unlockedBy
      });
      res.json(progress);
    } catch (error) {
      console.error("Error unlocking secret post:", error);
      res.status(500).json({ message: "Failed to unlock secret post" });
    }
  });

  app.get("/api/posts/:slug", async (req, res) => {
    try {
      const post = await storage.getPost(req.params.slug);
      if (!post) {
        res.status(404).json({ message: "Post not found" });
        return;
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, message, showEmail } = req.body;
      console.log('Received contact form submission from:', name);

      // Input validation
      if (!name || !email || !message) {
        console.log('Validation failed:', { name: !name, email: !email, message: !message });
        return res.status(400).json({
          message: "Please fill in all required fields",
          details: {
            name: !name ? "Name is required" : null,
            email: !email ? "Email is required" : null,
            message: !message ? "Message is required" : null
          }
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.log('Invalid email format:', email);
        return res.status(400).json({
          message: "Invalid email format",
          details: { email: "Please enter a valid email address" }
        });
      }

      console.log('Saving message to database...');
      // Save to database first
      const savedMessage = await storage.createContactMessage({
        name,
        email,
        message,
        showEmail
      });
      console.log('Message saved successfully with ID:', savedMessage.id);

      // Attempt to send email notification
      let emailSent = false;
      try {
        console.log('Attempting to send email notification...');
        await transporter.sendMail({
          from: 'vantalison@gmail.com',
          to: 'vantalison@gmail.com',
          subject: `New Contact Form Message from ${name}`,
          text: `
New message received from your horror blog contact form:

Sender Details:
--------------
Name: ${name}
Email: ${showEmail ? email : '(Email hidden by sender preference)'}

Message Content:
---------------
${message}

Timestamp: ${new Date().toLocaleString()}
          `,
          html: `
          <h2>New message received from your horror blog contact form</h2>

          <h3>Sender Details:</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${showEmail ? email : '<em>(Email hidden by sender preference)</em>'}</p>

          <h3>Message Content:</h3>
          <p style="white-space: pre-wrap;">${message}</p>

          <p><small>Received at: ${new Date().toLocaleString()}</small></p>
          `
        });
        emailSent = true;
        console.log('Email notification sent successfully');
      } catch (emailError: any) {
        console.error('Email sending failed:', {
          error: emailError.message,
          code: emailError.code,
          command: emailError.command,
          response: emailError.response
        });
      }

      // Return appropriate response
      res.json({
        message: emailSent
          ? "Message sent successfully"
          : "Message saved successfully, but there was an issue with email notification. Our team has been notified.",
        data: savedMessage,
        emailStatus: emailSent ? 'sent' : 'failed'
      });
    } catch (error: unknown) {
      console.error("Contact form error:", error);
      res.status(500).json({
        message: "Failed to process your message. Please try again later.",
        error: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      });
    }
  });

  // Get contact messages (admin only)
  app.get("/api/admin/messages", isAuthenticated, async (_req, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.get("/api/posts/comments/recent", async (_req, res) => {
    try {
      const comments = await storage.getRecentComments();
      res.json(comments);
    } catch (error) {
      console.error("Error fetching recent comments:", error);
      res.status(500).json({ message: "Failed to fetch recent comments" });
    }
  });

  app.get("/api/posts/:postId/comments", async (req, res) => {
    try {
      const comments = await storage.getComments(parseInt(req.params.postId));
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/posts/:postId/comments", async (req, res) => {
    try {
      const comment = await storage.createComment({
        ...req.body,
        postId: parseInt(req.params.postId)
      });
      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  return createServer(app);
}