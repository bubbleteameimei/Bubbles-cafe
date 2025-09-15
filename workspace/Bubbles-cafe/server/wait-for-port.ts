/**
 * Simple script to send port readiness signal to Replit
 */

const PORT = 3000;

if (process.send) {
  console.log(`⏱️ Signaling port ${PORT} readiness to Replit...`);
  process.send({
    port: PORT,
    wait_for_port: true,
    ready: true
  });
}

console.log('✅ Port readiness signal sent!');