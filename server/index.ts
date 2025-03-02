// Previous imports remain unchanged

// Update the server listening code in startServer function
async function startServer() {
  try {
    console.log('Starting server initialization...');

    // Check if database needs seeding
    const [{ value: postsCount }] = await db.select({ value: count() }).from(posts);
    if (postsCount === 0) {
      console.log('Database is empty, starting seeding process...');
      await seedDatabase();
      console.log('Database seeding completed successfully');
    } else {
      console.log(`Database already contains ${postsCount} posts, skipping seeding`);
    }

    // Create server instance
    server = createServer(app);

    // Register routes and middleware
    if (isDev) {
      console.log('Registering API routes');
      registerRoutes(app);
      console.log("API routes registered successfully");

      console.log('Setting up Vite middleware');
      await setupVite(app, server);
      console.log("Vite middleware setup complete");
    } else {
      console.log('Setting up static file serving');
      serveStatic(app);
      console.log("Static file serving setup complete");
    }

    // Start listening with enhanced error handling and port notification
    return new Promise<void>((resolve, reject) => {
      server.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running at http://0.0.0.0:${PORT}`);
        console.log('Debug: Server started successfully and waiting for connections');

        // Send port readiness signal with explicit wait_for_port flag
        if (process.send) {
          process.send({
            port: PORT,
            wait_for_port: true,
            ready: true
          });
          console.log('Debug: Sent port readiness signal to parent process');
        }

        resolve();
      });

      server.once('error', (err: Error) => {
        console.error(`Server error: ${err.message}`);
        reject(err);
      });
    });
  } catch (error) {
    console.error(`Failed to start server: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}
