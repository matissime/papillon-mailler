import { useState, useEffect } from 'react';
import { SmtpConfig } from '../types';
import { sendEmailsWithRateLimit } from '../utils/emailSender';

interface MailerProps {
  config: SmtpConfig;
  recipients: Array<{
    email: string;
    name?: string;
    customFields?: Record<string, string>;
  }>;
  subject: string;
  content: string;
  onComplete?: (success: boolean, failedCount: number) => void;
}

export const Mailer = ({ config, recipients, subject, content, onComplete }: MailerProps) => {
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'sending' | 'completed' | 'error'>('idle');
  const [failedCount, setFailedCount] = useState(0);

  const handleSend = async () => {
    if (!config || recipients.length === 0) return;
    
    setIsSending(true);
    setStatus('sending');
    setProgress(0);
    
    try {
      const emails = recipients.map(recipient => {
        let htmlContent = content;
        
        // Replace custom fields in content
        if (recipient.customFields) {
          Object.entries(recipient.customFields).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            htmlContent = htmlContent.replace(regex, value);
          });
        }
        
        // Replace name in content if available
        if (recipient.name) {
          htmlContent = htmlContent.replace(/{{name}}/g, recipient.name);
        }
        
        return {
          to: recipient.email,
          subject,
          html: htmlContent,
        };
      });
      
      const result = await sendEmailsWithRateLimit(
        config,
        emails,
        (progressValue) => {
          setProgress(progressValue);
        }
      );
      
      setFailedCount(result.failedEmails.length);
      setStatus(result.success ? 'completed' : 'error');
      
      if (onComplete) {
        onComplete(result.success, result.failedEmails.length);
      }
    } catch (error) {
      setStatus('error');
      if (onComplete) {
        onComplete(false, recipients.length);
      }
    } finally {
      setIsSending(false);
    }
  };
  
  useEffect(() => {
    return () => {
      // Cleanup if component unmounts during sending
    };
  }, []);
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">
            {isSending 
              ? `Sending emails (${Math.round(progress)}%)` 
              : status === 'completed' 
                ? `Completed! ${recipients.length - failedCount}/${recipients.length} emails sent` 
                : status === 'error' 
                  ? `Error! ${failedCount} emails failed` 
                  : `Ready to send ${recipients.length} emails`}
          </span>
          
          {!isSending && status !== 'completed' && (
            <button
              onClick={handleSend}
              disabled={isSending}
              className="btn-primary px-4 py-2 rounded-xl text-sm"
            >
              Send Emails
            </button>
          )}
        </div>
        
        {(isSending || status === 'completed') && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full transition-all duration-300 ease-in-out ${
                status === 'error' ? 'bg-red-500' : 'bg-primary'
              }`} 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
        
        {isSending && config.rateLimiting?.enabled && (
          <div className="text-xs text-gray-500 mt-1">
            <p>
              Rate limiting: {config.rateLimiting.delayBetweenEmails}ms delay between emails, 
              max {config.rateLimiting.maxPerMinute}/minute, 
              batch size: {config.rateLimiting.batchSize}
            </p>
            <p className="mt-1">
              Estimated time: {Math.ceil((recipients.length * (config.rateLimiting.delayBetweenEmails + 100)) / 60000)} minutes
            </p>
          </div>
        )}
        
        {status === 'error' && failedCount > 0 && (
          <div className="text-sm text-red-500 mt-2">
            {failedCount} emails failed to send. You can retry sending them later.
          </div>
        )}
      </div>
    </div>
  );
};