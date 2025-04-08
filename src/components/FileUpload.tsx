import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept: Record<string, string[]>;
}

export const FileUpload = ({ onFileSelect, accept }: FileUploadProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`glass-card p-8 text-center cursor-pointer transition-all hover:bg-white/40
      ${isDragActive ? 'ring-4 ring-primary/30 scale-[1.02] shadow-2xl' : ''}`}
    >
      <input {...getInputProps()} />
      <ArrowUpTrayIcon className="w-12 h-12 mx-auto text-primary/70 mb-4" />
      {isDragActive ? (
        <p className="text-lg text-primary/90 font-medium">
          Drop the file here...
        </p>
      ) : (
        <div>
          <p className="text-lg text-gray-700 font-medium mb-2">
            Drag & drop your file here
          </p>
          <p className="text-sm text-gray-500">
            Supports JSON, XLSX, XLS, and CSV files
          </p>
        </div>
      )}
    </div>
  );
};
