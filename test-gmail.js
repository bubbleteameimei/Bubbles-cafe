import nodemailer from 'nodemailer';

// Test Gmail configuration
async function testGmail() {
  console.log('Testing Gmail configuration...');
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'vantalison@gmail.com',
      pass: 'virz cgpj njom vddq'
    }
  });

  try {
    const verified = await transporter.verify();
    console.log('✅ Gmail verification successful:', verified);
    
    // Send test email
    const info = await transporter.sendMail({
      from: 'vantalison@gmail.com',
      to: 'vantalison@gmail.com',
      subject: 'Gmail Test from Interactive Storytelling Platform',
      text: 'Your Gmail integration is working correctly!',
      html: '<p>Your Gmail integration is working correctly!</p>'
    });
    
    console.log('✅ Test email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Gmail test failed:', error.message);
    return false;
  }
}

testGmail().then(success => {
  console.log('Gmail test completed:', success ? 'SUCCESS' : 'FAILED');
  process.exit(success ? 0 : 1);
});