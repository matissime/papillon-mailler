import { Contact } from '../types';

export const parseTemplate = (template: string, contact: Contact): string => {
  // Convert line breaks to HTML
  const htmlTemplate = template.replace(/\n/g, '<br/>');
  
  // Replace variables
  return htmlTemplate.replace(/\{\{(.*?)\}\}/g, (match, key) => {
    const trimmedKey = key.trim();
    return contact[trimmedKey]?.toString() || match;
  });
};

export const validateTemplate = (template: string, headers: string[]): string[] => {
  const variables: string[] = [];
  const regex = /\{\{(.*?)\}\}/g;
  let match;

  while ((match = regex.exec(template)) !== null) {
    const variable = match[1].trim();
    if (!headers.includes(variable)) {
      variables.push(variable);
    }
  }

  return variables;
};

export const getTemplateVariables = (template: string): string[] => {
  const variables: string[] = [];
  const regex = /\{\{(.*?)\}\}/g;
  let match;

  while ((match = regex.exec(template)) !== null) {
    variables.push(match[1].trim());
  }

  return Array.from(new Set(variables));
};

export const createPreview = (template: string): string => {
  // Convert line breaks to HTML
  const htmlTemplate = template.replace(/\n/g, '<br/>');
  
  // Replace variables with styled spans
  return htmlTemplate.replace(/\{\{(.*?)\}\}/g, (match, key) => {
    const trimmedKey = key.trim();
    return `<span class="text-primary font-medium">${trimmedKey}</span>`;
  });
};