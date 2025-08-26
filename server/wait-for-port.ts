/**
 * Simple script to send port readiness signal to Replit
 */

const PORT = Number(process.env.PORT || 3002);

if (process.send) {
  console.log(`⏱️ Signaling port ${PORT} readiness to Replit...`);
  process.send({
    port: PORT,
    wait_for_port: true,
    ready: true
  });
}

console.log('✅ Port readiness signal sent!');