import { useState, useEffect } from 'react';
import { SmtpConfig as SmtpConfigType } from '../types';
import { KeyIcon, ServerIcon, UserIcon, EnvelopeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface SmtpConfigProps {
  onSave: (config: SmtpConfigType) => void;
  initialConfig?: SmtpConfigType | null;
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
};

export const SmtpConfig = ({ onSave, initialConfig }: SmtpConfigProps) => {
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
