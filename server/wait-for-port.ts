/**
 * Simple script to send port readiness signal to Replit
 */

const PORT = 3000;

if (process.send) {
  
  process.send({
    port: PORT,
    wait_for_port: true,
    ready: true
  });
}

