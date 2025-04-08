import { useEffect, useState } from 'react';
import { EnvelopeIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { EmailTemplate as EmailTemplateType } from '../types';
import { createPreview, getTemplateVariables, validateTemplate } from '../utils/templateParser';

interface EmailTemplateProps {
  onSave: (template: EmailTemplateType) => void;
  availableFields: string[];
  initialTemplate?: EmailTemplateType | null;
}

const defaultTemplate: EmailTemplateType = {
  subject: '',
  body: '',
};

export const EmailTemplate = ({ onSave, availableFields, initialTemplate }: EmailTemplateProps) => {
  const [template, setTemplate] = useState<EmailTemplateType>(() => 
    initialTemplate || defaultTemplate
  );

  const [preview, setPreview] = useState('');
  const [missingVariables, setMissingVariables] = useState<string[]>([]);
  const [usedVariables, setUsedVariables] = useState<string[]>([]);

  useEffect(() => {
    if (initialTemplate) {
      setTemplate(initialTemplate);
    }
  }, [initialTemplate]);

  useEffect(() => {
    const missing = validateTemplate(template.body, availableFields);
    const used = getTemplateVariables(template.body);
    setMissingVariables(missing);
    setUsedVariables(used);
    setPreview(createPreview(template.body));
  }, [template.body, availableFields]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (missingVariables.length === 0) {
      onSave(template);
    }
  };

  const insertVariable = (variable: string) => {
    const textArea = document.getElementById('emailBody') as HTMLTextAreaElement;
    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    const currentBody = template.body;
    const newBody = 
      currentBody.substring(0, start) +
      `{{${variable}}}` +
      currentBody.substring(end);
    
    setTemplate((prev) => ({ ...prev, body: newBody }));
    
    // Set cursor position after inserted variable
    setTimeout(() => {
      const newPosition = start + variable.length + 4; // 4 for {{ and }}
      textArea.setSelectionRange(newPosition, newPosition);
      textArea.focus();
    }, 0);
  };

  return (
    <div className="glass-card p-6 space-y-6">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <EnvelopeIcon className="w-6 h-6 text-primary/70" />
        Email Template
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={template.subject}
              onChange={(e) =>
                setTemplate((prev) => ({ ...prev, subject: e.target.value }))
              }
              className="input-field"
              required
              placeholder="Enter email subject..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Variables
            </label>
            <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50/50 rounded-xl border border-gray-100">
              {availableFields.map((field) => (
                <button
                  key={field}
                  type="button"
                  onClick={() => insertVariable(field)}
                  className={`px-3 py-1.5 text-sm rounded-xl transition-all
                  ${
                    usedVariables.includes(field)
                      ? 'bg-primary/10 text-primary'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {`{{${field}}}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <DocumentTextIcon className="w-4 h-4 text-primary/70" />
            Body
          </label>
          <textarea
            id="emailBody"
            value={template.body}
            onChange={(e) =>
              setTemplate((prev) => ({ ...prev, body: e.target.value }))
            }
            className="input-field min-h-[200px] font-mono text-sm"
            required
            placeholder="Write your email template here..."
          />
        </div>

        {missingVariables.length > 0 && (
          <div className="text-red-500 text-sm p-3 bg-red-50 rounded-xl">
            Unknown variables:{' '}
            {missingVariables.map((v) => `{{${v}}}`).join(', ')}
          </div>
        )}

        {template.body && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <EnvelopeIcon className="w-4 h-4 text-primary/70" />
              Preview
            </h3>
            <div
              className="p-4 bg-white/50 rounded-xl border border-gray-100 whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: preview }}
            />
          </div>
        )}

        <button
          type="submit"
          className="btn-primary w-full rounded-xl"
          disabled={missingVariables.length > 0}
        >
          Save Template
        </button>
      </form>
    </div>
  );
};
