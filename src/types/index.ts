export interface Contact {
  email: string;
  [key: string]: string | number | boolean; // For dynamic fields from imported file
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
}

export interface EmailTemplate {
  subject: string;
  body: string;
}

export interface ImportedData {
  headers: string[];
  contacts: Contact[];
}

export type FileType = 'json' | 'xlsx' | 'xls' | 'csv';
