import { useState, useEffect } from 'react';
import { SmtpConfig as SmtpConfigType } from '../types';
import { KeyIcon, ServerIcon, UserIcon, EnvelopeIcon, ArrowPathIcon, DocumentTextIcon, ClockIcon, ShieldExclamationIcon, InboxArrowDownIcon } from '@heroicons/react/24/outline';

interface SmtpConfigProps {
  onSave: (config: SmtpConfigType) => void;
  initialConfig?: SmtpConfigType | null;
  onSending?: (progress: number) => void;
  isSending?: boolean;
}

const defaultConfig: SmtpConfigType = {
  host: '',
  port: 587,
  username: '',
  password: '',
  secure: false,
  senderName: '',
  senderEmail: '',
  replyToEmail: '',
  useSignature: false,
  signature: '',
  saveToSent: true,
  rateLimiting: {
    enabled: true,
    delayBetweenEmails: 2000, // 2 seconds
    maxPerMinute: 30,
    maxPerHour: 500,
    batchSize: 10,
  }
};

export const SmtpConfig = ({ onSave, initialConfig, onSending, isSending }: SmtpConfigProps) => {
  const [config, setConfig] = useState<SmtpConfigType>(() => 
    initialConfig || defaultConfig
  );

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    }
  }, [initialConfig]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config);
  };

  return (
    <div className="glass-card p-6 rounded-2xl">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <ServerIcon className="w-6 h-6 text-primary/70" />
        SMTP Configuration
      </h2>
      
      {isSending && (
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">Sending Progress</h3>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div 
              className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-in-out" 
              style={{ width: `${onSending !== undefined ? 0 : 100}%` }}
            ></div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Server Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700 flex items-center gap-2">
            <ServerIcon className="w-5 h-5 text-primary/70" />
            Server Settings
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Host
              </label>
              <input
                type="text"
                value={config.host}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, host: e.target.value }))
                }
                className="input-field rounded-xl"
                required
                placeholder="smtp.example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Port
              </label>
              <input
                type="number"
                value={config.port}
                onChange={(e) => {
                  const port = parseInt(e.target.value);
                  setConfig((prev) => ({ 
                    ...prev, 
                    port,
                    secure: port === 465
                  }));
                }}
                className="input-field rounded-xl"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={config.username}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, username: e.target.value }))
              }
              className="input-field rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <KeyIcon className="w-4 h-4 text-primary/70" />
              Password
            </label>
            <input
              type="password"
              value={config.password}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, password: e.target.value }))
              }
              className="input-field rounded-xl"
              required
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="saveToSent"
              checked={config.saveToSent}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, saveToSent: e.target.checked }))
              }
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="saveToSent" className="ml-2 flex items-center gap-1 text-sm text-gray-700">
              <InboxArrowDownIcon className="w-4 h-4 text-primary/70" />
              Save sent emails to Sent folder
            </label>
          </div>
        </div>

        {/* Sender Details */}
        <div className="space-y-4 border-t border-gray-100 pt-4">
          <h3 className="text-lg font-medium text-gray-700 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-primary/70" />
            Sender Details
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sender Name
            </label>
            <input
              type="text"
              value={config.senderName}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, senderName: e.target.value }))
              }
              className="input-field rounded-xl"
              required
              placeholder="Company Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sender Email
            </label>
            <input
              type="email"
              value={config.senderEmail}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, senderEmail: e.target.value }))
              }
              className="input-field rounded-xl"
              required
              placeholder="noreply@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <ArrowPathIcon className="w-4 h-4 text-primary/70" />
              Reply-To Email
            </label>
            <input
              type="email"
              value={config.replyToEmail}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, replyToEmail: e.target.value }))
              }
              className="input-field rounded-xl"
              required
              placeholder="contact@company.com"
            />
          </div>
        </div>

        {/* Rate Limiting Prevention */}
        <div className="space-y-4 border-t border-gray-100 pt-4">
          <h3 className="text-lg font-medium text-gray-700 flex items-center gap-2">
            <ShieldExclamationIcon className="w-5 h-5 text-primary/70" />
            Rate Limiting Prevention
          </h3>
          
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="enableRateLimiting"
              checked={config.rateLimiting?.enabled ?? false}
              onChange={(e) =>
                setConfig((prev) => ({ 
                  ...prev, 
                  rateLimiting: {
                    ...prev.rateLimiting,
                    enabled: e.target.checked
                  }
                }))
              }
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="enableRateLimiting" className="ml-2 block text-sm text-gray-700">
              Enable rate limiting prevention
            </label>
          </div>

          {config.rateLimiting?.enabled && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-primary/70" />
                    Delay Between Emails (ms)
                  </label>
                  <input
                    type="number"
                    value={config.rateLimiting?.delayBetweenEmails ?? 2000}
                    onChange={(e) =>
                      setConfig((prev) => ({ 
                        ...prev, 
                        rateLimiting: {
                          ...prev.rateLimiting,
                          delayBetweenEmails: parseInt(e.target.value) || 0
                        }
                      }))
                    }
                    min="0"
                    step="100"
                    className="input-field rounded-xl"
                    placeholder="2000"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Time to wait between sending each email (in milliseconds)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch Size
                  </label>
                  <input
                    type="number"
                    value={config.rateLimiting?.batchSize ?? 10}
                    onChange={(e) =>
                      setConfig((prev) => ({ 
                        ...prev, 
                        rateLimiting: {
                          ...prev.rateLimiting,
                          batchSize: parseInt(e.target.value) || 1
                        }
                      }))
                    }
                    min="1"
                    className="input-field rounded-xl"
                    placeholder="10"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Number of emails to send in each batch before pausing
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Emails Per Minute
                  </label>
                  <input
                    type="number"
                    value={config.rateLimiting?.maxPerMinute ?? 30}
                    onChange={(e) =>
                      setConfig((prev) => ({ 
                        ...prev, 
                        rateLimiting: {
                          ...prev.rateLimiting,
                          maxPerMinute: parseInt(e.target.value) || 0
                        }
                      }))
                    }
                    min="0"
                    className="input-field rounded-xl"
                    placeholder="30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Emails Per Hour
                  </label>
                  <input
                    type="number"
                    value={config.rateLimiting?.maxPerHour ?? 500}
                    onChange={(e) =>
                      setConfig((prev) => ({ 
                        ...prev, 
                        rateLimiting: {
                          ...prev.rateLimiting,
                          maxPerHour: parseInt(e.target.value) || 0
                        }
                      }))
                    }
                    min="0"
                    className="input-field rounded-xl"
                    placeholder="500"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl text-sm">
            <p className="font-medium">Why is this important?</p>
            <p className="mt-1">Email servers often have sending limits to prevent spam. These settings help you stay within those limits by controlling the rate at which emails are sent.</p>
          </div>
        </div>

        {/* Email Signature */}
        <div className="space-y-4 border-t border-gray-100 pt-4">
          <h3 className="text-lg font-medium text-gray-700 flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5 text-primary/70" />
            Email Signature
          </h3>
          
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="useSignature"
              checked={config.useSignature}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, useSignature: e.target.checked }))
              }
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="useSignature" className="ml-2 block text-sm text-gray-700">
              Add signature to emails
            </label>
          </div>

          {config.useSignature && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HTML Signature
              </label>
              <textarea
                value={config.signature}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, signature: e.target.value }))
                }
                className="input-field min-h-[150px] font-mono text-sm rounded-xl"
                placeholder="<div>Your signature HTML here</div>"
                rows={5}
              />
              <p className="text-xs text-gray-500 mt-2">
                You can use HTML tags to style your signature
              </p>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-600 mt-2 p-4 bg-gray-50 rounded-xl">
          <p>SSL/TLS will be automatically configured based on the port:</p>
          <ul className="list-disc ml-5 mt-1">
            <li>Port 465: SSL/TLS enabled</li>
            <li>Port 587 or 25: STARTTLS (secure upgrade)</li>
          </ul>
        </div>

        <button type="submit" className="btn-primary w-full rounded-xl">
          Save SMTP Configuration
        </button>
      </form>
    </div>
  );
};
