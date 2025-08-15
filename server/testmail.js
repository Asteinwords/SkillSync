const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('SMTP Credentials:', {
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS ? '[REDACTED]' : undefined,
  from: process.env.EMAIL_FROM,
});

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function testEmail() {
  try {
    await transporter.verify();
    console.log('Transporter verified successfully');
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: 'asteinwords@gmail.com',
      subject: 'Test Email from SkillSync',
      text: 'This is a test email from your SkillSync app.',
    });
    console.log('Test email sent successfully');
  } catch (error) {
    console.error('Test email failed:', {
      error: error.message,
      code: error.code,
      command: error.command,
    });
  }
}

testEmail();