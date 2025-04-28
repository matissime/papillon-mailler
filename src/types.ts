export interface RateLimitingConfig {
  enabled: boolean;
  delayBetweenEmails: number; // milliseconds
  maxPerMinute: number;
  maxPerHour: number; 
  batchSize: number;
}

export interface SmtpConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  secure: boolean;
  senderName: string;
  senderEmail: string;
  replyToEmail: string;
  useSignature: boolean;
  signature: string;
  rateLimiting: RateLimitingConfig;
  saveToSent: boolean;
}