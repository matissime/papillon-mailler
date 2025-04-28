import { SmtpConfig, RateLimitingConfig } from '../types';

interface EmailTask {
  to: string;
  subject: string;
  html: string;
  cc?: string;
  bcc?: string;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Sends emails with rate limiting to avoid server restrictions
 */
export async function sendEmailsWithRateLimit(
  config: SmtpConfig,
  emails: EmailTask[],
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; failedEmails: EmailTask[], error?: string }> {
  const { rateLimiting } = config;
  
  if (!rateLimiting || !rateLimiting.enabled) {
    return sendAllEmails(config, emails, onProgress);
  }
  
  const {
    delayBetweenEmails = 2000,
    maxPerMinute = 30,
    maxPerHour = 500,
    batchSize = 10
  } = rateLimiting;
  
  const failedEmails: EmailTask[] = [];
  const totalEmails = emails.length;
  let sentCount = 0;
  let minuteCount = 0;
  let hourCount = 0;
  
  const startHour = Date.now();
  let startMinute = Date.now();
  
  try {
    // Process emails in batches
    for (let i = 0; i < emails.length; i += batchSize) {
      const currentTime = Date.now();
      
      // Reset minute counter if a minute has passed
      if (currentTime - startMinute > 60000) {
        minuteCount = 0;
        startMinute = currentTime;
      }
      
      // Check hourly limit
      if (hourCount >= maxPerHour) {
        if (currentTime - startHour < 3600000) {
          // Wait until the hour is up
          const timeToWait = 3600000 - (currentTime - startHour);
          if (onProgress) onProgress((sentCount / totalEmails) * 100);
          await sleep(timeToWait);
          hourCount = 0;
        } else {
          hourCount = 0;
        }
      }
      
      // Calculate how many emails we can send in this batch
      const remainingInMinute = maxPerMinute - minuteCount;
      const remainingInHour = maxPerHour - hourCount;
      const emailsLeft = emails.length - i;
      
      const batchEndIndex = i + Math.min(
        batchSize,
        remainingInMinute,
        remainingInHour,
        emailsLeft
      );
      
      const batch = emails.slice(i, batchEndIndex);
      
      // Send the batch
      for (const email of batch) {
        try {
          // Here would be the actual email sending logic
          // Replace with actual implementation
          // await sendEmail(config, email);
          
          sentCount++;
          minuteCount++;
          hourCount++;
          
          if (onProgress) {
            onProgress((sentCount / totalEmails) * 100);
          }
          
          // Add delay between emails
          if (delayBetweenEmails > 0 && sentCount < totalEmails) {
            await sleep(delayBetweenEmails);
          }
        } catch (error) {
          failedEmails.push(email);
        }
      }
      
      // If we've hit the minute limit, wait until the minute is up
      if (minuteCount >= maxPerMinute) {
        const elapsedMinute = Date.now() - startMinute;
        if (elapsedMinute < 60000) {
          await sleep(60000 - elapsedMinute);
        }
        minuteCount = 0;
        startMinute = Date.now();
      }
    }
    
    return {
      success: failedEmails.length === 0,
      failedEmails
    };
  } catch (error) {
    return {
      success: false,
      failedEmails: [...failedEmails, ...emails.slice(sentCount)],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Simplified version without rate limiting (for reference or if rate limiting is disabled)
async function sendAllEmails(
  config: SmtpConfig,
  emails: EmailTask[],
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; failedEmails: EmailTask[], error?: string }> {
  const failedEmails: EmailTask[] = [];
  const totalEmails = emails.length;
  
  try {
    for (let i = 0; i < emails.length; i++) {
      try {
        // Replace with actual email sending implementation
        // await sendEmail(config, emails[i]);
        
        if (onProgress) {
          onProgress(((i + 1) / totalEmails) * 100);
        }
      } catch (error) {
        failedEmails.push(emails[i]);
      }
    }
    
    return {
      success: failedEmails.length === 0,
      failedEmails
    };
  } catch (error) {
    return {
      success: false,
      failedEmails,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}