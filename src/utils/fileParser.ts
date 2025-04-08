import * as XLSX from 'xlsx';
import { Contact, ImportedData, FileType } from '../types';

export const parseFile = async (file: File): Promise<ImportedData> => {
  const fileType = file.name.split('.').pop()?.toLowerCase() as FileType;
  
  if (fileType === 'json') {
    return parseJsonFile(file);
  } else if (['xlsx', 'xls', 'csv'].includes(fileType)) {
    return parseExcelFile(file);
  }
  
  throw new Error('Unsupported file type');
};

const parseJsonFile = async (file: File): Promise<ImportedData> => {
  const text = await file.text();
  const json = JSON.parse(text);
  
  if (!Array.isArray(json)) {
    throw new Error('JSON must contain an array of contacts');
  }
  
  const contacts = json as Contact[];
  const headers = Array.from(
    new Set(contacts.flatMap(contact => Object.keys(contact)))
  );
  
  return { headers, contacts };
};

const parseExcelFile = async (file: File): Promise<ImportedData> => {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json<Contact>(worksheet);
  
  const headers = Array.from(
    new Set(data.flatMap(contact => Object.keys(contact)))
  );
  
  return { headers, contacts: data };
};
