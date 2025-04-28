import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import Imap from 'node-imap';
import { simpleParser } from 'mailparser';

const app = express();
app.use(cors());
app.use(express.json());

// Function to save email to sent folder using IMAP
async function saveEmailToSentFolder(smtpConfig, emailContent) {
  return new Promise((resolve, reject) => {
    try {
      const imap = new Imap({
        user: smtpConfig.username,
        password: smtpConfig.password,
        host: smtpConfig.host,
        port: smtpConfig.secure ? 993 : 143,
        tls: smtpConfig.secure,
        tlsOptions: { rejectUnauthorized: false }
      });

      imap.once('ready', function() {
        imap.openBox('Sent', true, function(err, box) {
          if (err) {
            // Try alternative sent folder names if 'Sent' doesn't exist
            imap.getBoxes(function(err, boxes) {
              if (err) {
                imap.end();
                return reject(new Error('Failed to get mailboxes: ' + err.message));
              }
              
              // Common sent folder names across different email providers
              const sentFolderNames = ['Sent', 'Sent Items', 'Sent Mail', '[Gmail]/Sent Mail', '[Gmail]/Sent'];
              
              // Find a matching sent folder
              let sentFolder = null;
              for (const name of sentFolderNames) {
                const parts = name.split('/');
                let current = boxes;
                let found = true;
                
                for (const part of parts) {
                  if (!current[part]) {
                    found = false;
                    break;
                  }
                  current = current[part].children;
                }
                
                if (found) {
                  sentFolder = name;
                  break;
                }
              }
              
              if (!sentFolder) {
                imap.end();
                return reject(new Error('No sent folder found'));
              }
              
              // Open the found sent folder
              imap.openBox(sentFolder, false, function(err) {
                if (err) {
                  imap.end();
                  return reject(new Error('Failed to open sent folder: ' + err.message));
                }
                
                appendEmail();
              });
            });
          } else {
            appendEmail();
          }
        });
      });

      function appendEmail() {
        // Construct RFC822 message
        const message = emailContent;
        
        imap.append(message, {mailbox: 'Sent', flags: ['\\Seen']}, function(err) {
          imap.end();
          if (err) {
            return reject(new Error('Failed to save email to sent folder: ' + err.message));
          }
          resolve(true);
        });
      }

      imap.once('error', function(err) {
        reject(new Error('IMAP error: ' + err.message));
      });

      imap.connect();
    } catch (error) {
      reject(error);
    }
  });
}

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
      pool: true, // Use pooled connection
      maxConnections: 5, // Maximum number of simultaneous connections
      maxMessages: 100, // Maximum number of messages per connection
      socketTimeout: 30000, // Socket timeout in ms
    });
    
    // Append signature to email body if enabled
    let htmlBody = email.body;
    if (smtpConfig.useSignature && smtpConfig.signature) {
      htmlBody += `<div class="signature-divider" style="margin-top: 20px; margin-bottom: 20px; border-top: 1px solid #eaeaea;"></div>`;
      htmlBody += smtpConfig.signature;
    }

    console.log('Sending email:', {
      from: `"${smtpConfig.senderName}" <${smtpConfig.senderEmail}>`,
      replyTo: smtpConfig.replyToEmail,
      to: email.to,
      subject: email.subject,
      html: htmlBody,
      saveToSent: !!smtpConfig.saveToSent
    });

    const emailOptions = {
      from: `"${smtpConfig.senderName}" <${smtpConfig.senderEmail}>`,
      to: email.to,
      subject: email.subject,
      replyTo: smtpConfig.replyToEmail,
      alternatives: [
        {
          contentType: 'text/plain',
          content: htmlBody.replace(/<br\s*\/?>/g, '\n').replace(/<[^>]+>/g, '')
        },
        {
          contentType: 'text/html',
          content: htmlBody
        }
      ]
    };

    const info = await transporter.sendMail(emailOptions);

    // If user wants to save to sent folder, use IMAP to append to sent folder
    if (smtpConfig.saveToSent) {
      try {
        // Generate raw email content for IMAP
        const rawEmail = await new Promise((resolve, reject) => {
          transporter.sendMail({ ...emailOptions, envelope: true }, (err, info) => {
            if (err) return reject(err);
            resolve(info.message.toString());
          });
        });
        
        await saveEmailToSentFolder(smtpConfig, rawEmail);
        console.log('Email saved to sent folder');
      } catch (saveError) {
        console.warn('Failed to save email to sent folder:', saveError.message);
        // Don't fail the request if saving to sent folder fails
      }
    }

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
