import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/send-email', async (req, res) => {
  try {
    const { smtpConfig, email } = req.body;
    
    console.log('Creating transporter with config:', {
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.username,
        pass: smtpConfig.password,
      },
    });

    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.username,
        pass: smtpConfig.password,
      },
    });

    console.log('Sending email:', {
      from: `"${smtpConfig.senderName}" <${smtpConfig.senderEmail}>`,
      replyTo: smtpConfig.replyToEmail,
      to: email.to,
      subject: email.subject,
      html: email.body,
    });

    const info = await transporter.sendMail({
      from: `"${smtpConfig.senderName}" <${smtpConfig.senderEmail}>`,
      to: email.to,
      subject: email.subject,
      html: email.body,
      replyTo: smtpConfig.replyToEmail,
      alternatives: [
        {
          contentType: 'text/plain',
          content: email.body.replace(/<br\s*\/?>/g, '\n').replace(/<[^>]+>/g, '')
        },
        {
          contentType: 'text/html',
          content: email.body
        }
      ]
    });

    console.log('Email sent:', info);
    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.response || 'No additional details'
    });
  }
});

const PORT = process.env.PORT || 3001;

const startServer = () => {
  try {
    app.listen(PORT, () => {
      console.log(`✨ Email server running on port ${PORT}`);
    });
  } catch (error) {
    if (error.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${PORT} is busy, trying ${PORT + 1}...`);
      startServer(PORT + 1);
    } else {
      console.error('Server error:', error);
      process.exit(1);
    }
  }
};

startServer();
