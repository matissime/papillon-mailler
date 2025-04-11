import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { FileUpload } from './components/FileUpload';
import { SmtpConfig } from './components/SmtpConfig';
import { EmailTemplate } from './components/EmailTemplate';
import { Contact, EmailTemplate as EmailTemplateType, ImportedData, SmtpConfig as SmtpConfigType } from './types';
import { parseFile } from './utils/fileParser';
import { parseTemplate } from './utils/templateParser';

const steps = [
  { id: 1, title: 'Import Contacts', description: 'Upload your contact list file' },
  { id: 2, title: 'Configure SMTP', description: 'Set up your email server details' },
  { id: 3, title: 'Create Template', description: 'Design your email template' },
  { id: 4, title: 'Review & Send', description: 'Review and send your emails' },
] as const;

// Load state from localStorage
const loadState = (key: string) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.error(`Error loading ${key} from localStorage:`, e);
    return null;
  }
};

// Save state to localStorage
const saveState = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
};

function App() {
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem('currentStep');
    return saved ? parseInt(saved) : 1;
  });

  const [importedData, setImportedData] = useState<ImportedData | null>(() => loadState('importedData'));
  const [smtpConfig, setSmtpConfig] = useState<SmtpConfigType | null>(() => loadState('smtpConfig'));
  const [emailTemplate, setEmailTemplate] = useState<EmailTemplateType | null>(() => loadState('emailTemplate'));
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Save state changes
  useEffect(() => {
    localStorage.setItem('currentStep', currentStep.toString());
  }, [currentStep]);

  useEffect(() => {
    if (importedData) saveState('importedData', importedData);
  }, [importedData]);

  useEffect(() => {
    if (smtpConfig) saveState('smtpConfig', smtpConfig);
  }, [smtpConfig]);

  useEffect(() => {
    if (emailTemplate) saveState('emailTemplate', emailTemplate);
  }, [emailTemplate]);

  useEffect(() => {
    // Set first contact as default for preview when contacts are loaded
    if (importedData?.contacts?.length && !selectedContact) {
      setSelectedContact(importedData.contacts[0]);
    }
  }, [importedData, selectedContact]);

  const handleFileSelect = async (file: File) => {
    try {
      const data = await parseFile(file);
      setImportedData(data);
      toast.success('File imported successfully!');
    } catch (error) {
      toast.error('Error importing file: ' + (error as Error).message);
    }
  };

  const handleSmtpSave = (config: SmtpConfigType) => {
    setSmtpConfig(config);
    toast.success('SMTP configuration saved!');
  };

  const handleTemplateSave = (template: EmailTemplateType) => {
    setEmailTemplate(template);
    toast.success('Email template saved!');
  };

  const handleSendEmails = async () => {
    if (!importedData || !smtpConfig || !emailTemplate) {
      toast.error('Please complete all configurations before sending emails.');
      return;
    }

    setSending(true);
    setProgress({ current: 0, total: importedData.contacts.length });

    console.group('📧 Email Sending Process');
    console.log('📊 Total contacts:', importedData.contacts.length);

    try {
      for (let index = 0; index < importedData.contacts.length; index++) {
        const contact = importedData.contacts[index];
        const parsedSubject = parseTemplate(emailTemplate.subject, contact);
        const parsedBody = parseTemplate(emailTemplate.body, contact);

        console.group(`📨 Email ${index + 1}/${importedData.contacts.length}`);
        console.log('To:', contact.email);
        console.log('Subject:', parsedSubject);

        try {
          const response = await fetch('http://localhost:3001/send-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              smtpConfig,
              email: {
                to: contact.email,
                subject: parsedSubject,
                body: parsedBody,
              },
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to send email');
          }

          const result = await response.json();
          console.log('Status: ✅ Sent successfully');
          setProgress(prev => ({ ...prev, current: index + 1 }));
        } catch (error) {
          console.error('Failed to send email:', error);
          toast.error(`Failed to send email to ${contact.email}: ${error instanceof Error ? error.message : 'Server connection failed'}`);
        }

        console.groupEnd();
      }
    } catch (error) {
      console.error('Process error:', error);
      toast.error('Error in sending process: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSending(false);
      console.groupEnd();
    }

    toast.success(`Completed sending ${importedData.contacts.length} emails!`);
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(current => current + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(current => current - 1);
    }
  };

  const canProceed = {
    1: !!importedData,
    2: !!smtpConfig,
    3: !!emailTemplate,
    4: true,
  }[currentStep];

  // Function to generate preview content based on selected contact
  const getEmailPreview = () => {
    if (!emailTemplate || !selectedContact) return { subject: '', body: '' };
    
    const parsedSubject = parseTemplate(emailTemplate.subject, selectedContact);
    let parsedBody = parseTemplate(emailTemplate.body, selectedContact);
    
    // Add signature if enabled
    if (smtpConfig?.useSignature && smtpConfig?.signature) {
      parsedBody += `<div class="signature-divider" style="margin-top: 20px; margin-bottom: 20px; border-top: 1px solid #eaeaea;"></div>`;
      parsedBody += smtpConfig.signature;
    }
    
    return { subject: parsedSubject, body: parsedBody };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 p-8">
      <Toaster position="top-right" />
      
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <div className="flex flex-col items-center gap-4">
            <img src="/logo.png" alt="Papillon Logo" className="w-24 h-24 object-contain" />
            <h1 className="text-4xl font-bold text-gray-900">Papillon</h1>
          </div>
          <p className="text-gray-600 flex items-center justify-center gap-2">
            <span className="text-primary">✧</span>
            Mass mailing solution that flows like a butterfly
            <span className="text-primary">✧</span>
          </p>
        </header>

        {/* Step Progress */}
        <div className="mb-12">
          <div className="flex justify-between">
            {steps.map(step => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  step.id === currentStep
                    ? 'text-primary'
                    : step.id < currentStep
                    ? 'text-green-500'
                    : 'text-gray-300'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2 
                  ${
                    step.id === currentStep
                      ? 'border-primary text-primary'
                      : step.id < currentStep
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-gray-300 text-gray-300'
                  }`}
                >
                  {step.id < currentStep ? '✓' : step.id}
                </div>
                <div className="text-sm font-medium">{step.title}</div>
                <div className="text-xs text-gray-500">{step.description}</div>
              </div>
            ))}
          </div>
          <div className="relative mt-4">
            <div className="absolute w-full h-1 bg-gray-200 rounded"></div>
            <div
              className="absolute h-1 bg-primary rounded transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="glass-card p-8 min-h-[400px] flex flex-col justify-between">
          <div className="step-content">
          {currentStep === 1 && (
            <div className="space-y-6">
              <FileUpload
                onFileSelect={handleFileSelect}
                accept={{
                  'application/json': ['.json'],
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                    ['.xlsx'],
                  'application/vnd.ms-excel': ['.xls'],
                  'text/csv': ['.csv'],
                }}
              />
              {importedData && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-700 mb-2">Imported Data</h3>
                  <div className="text-sm text-gray-600">
                    {importedData.contacts.length} contacts loaded
                  </div>
                  <div className="text-sm text-gray-600">
                    Available fields: {importedData.headers.join(', ')}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <SmtpConfig onSave={handleSmtpSave} initialConfig={smtpConfig} />
          )}

          {currentStep === 3 && importedData && (
            <EmailTemplate
              onSave={handleTemplateSave}
              availableFields={importedData.headers}
              initialTemplate={emailTemplate}
            />
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Review & Send</h2>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-2">Contact List</h3>
                  <p className="text-sm text-gray-600">
                    {importedData?.contacts.length} contacts loaded
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-2">SMTP Configuration</h3>
                  <p className="text-sm text-gray-600">
                    Server: {smtpConfig?.host}:{smtpConfig?.port}
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-700">Email Preview</h3>
                    
                    {importedData && importedData.contacts.length > 0 && (
                      <div className="flex items-center gap-2">
                        <label htmlFor="contact-select" className="text-sm text-gray-600">
                          Preview for:
                        </label>
                        <select
                          id="contact-select"
                          className="text-sm rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
                          onChange={(e) => {
                            const contactIndex = parseInt(e.target.value);
                            setSelectedContact(importedData.contacts[contactIndex]);
                          }}
                          value={importedData.contacts.indexOf(selectedContact || importedData.contacts[0])}
                        >
                          {importedData.contacts.map((contact, index) => (
                            <option key={index} value={index}>
                              {contact.email}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  
                  {selectedContact && (
                    <div className="email-preview border border-gray-200 rounded-lg overflow-hidden">
                      <div className="email-header bg-gray-100 p-3 border-b border-gray-200">
                        <div className="text-sm">
                          <span className="font-medium">To:</span> {selectedContact.email}
                        </div>
                        <div className="text-sm mt-1">
                          <span className="font-medium">Subject:</span> {getEmailPreview().subject}
                        </div>
                      </div>
                      
                      <div className="email-body bg-white p-4">
                        <div 
                          className="text-sm prose max-w-none"
                          dangerouslySetInnerHTML={{ __html: getEmailPreview().body }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {sending && (
                  <div className="text-sm text-gray-600">
                    Sending... {progress.current}/{progress.total}
                  </div>
                )}
                <button
                  onClick={handleSendEmails}
                  disabled={sending}
                  className={`btn-primary w-full py-3 text-lg ${
                    sending ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {sending ? 'Sending...' : 'Send Emails'}
                </button>
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8 px-4">
          <button
            onClick={handleBack}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200
            ${
              currentStep === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            disabled={currentStep === 1}
          >
            Back
          </button>
          {currentStep < steps.length && (
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className={`btn-primary px-6 py-2 min-w-[120px] ${
                !canProceed ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
