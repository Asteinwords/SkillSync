const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

// Define Contact schema and model
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const Contact = mongoose.model('Contact', contactSchema);

// Nodemailer transporter (using existing Brevo SMTP setup)
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter
transporter.verify((error, success) => {
  if (error) {
    console.error(`[${new Date().toISOString()}] Contact Transporter verification failed:`, {
      error: error.message,
      code: error.code,
      command: error.command,
    });
  } else {
    console.log('Contact Transporter is ready to send emails');
  }
});

// Send email helper
const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
    });
    console.log(`[${new Date().toISOString()}] Contact email sent to ${to} with subject: ${subject}`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Contact email sending failed:`, {
      error: error.message,
      code: error.code,
      command: error.command,
      to,
      subject,
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// POST /api/contact
router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;

  try {
    // Validate input
    if (!name || !email || !subject || !message) {
      console.log(`[${new Date().toISOString()}] Missing contact form fields:`, { name, email, subject, message });
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Save to MongoDB
    const contact = await Contact.create({ name, email, subject, message });
    console.log(`[${new Date().toISOString()}] Contact message saved:`, { id: contact._id, email });

    // Send email to support team
    const emailText = `New contact form submission:\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}`;
    await sendEmail(
      process.env.SUPPORT_EMAIL || 'support@skillsync.com',
      `Contact Form: ${subject}`,
      emailText
    );

    res.status(201).json({ message: 'Message sent successfully' });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Contact form error:`, {
      error: err.message,
      stack: err.stack,
      email,
    });
    res.status(500).json({ message: `Failed to send message: ${err.message}` });
  }
});

module.exports = router;