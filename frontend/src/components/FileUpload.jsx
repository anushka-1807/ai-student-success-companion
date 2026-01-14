import { useState, useRef } from 'react';
import { Upload, X, FileText, Image, Music } from 'lucide-react';

function FileUpload({ 
  accept, 
  onFileSelect, 
  label = 'Upload a file',
  description = 'Drag and drop or click to browse',
  maxSize = 50 // MB
}) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file) => {
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return false;
    }
    setError('');
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    onFileSelect(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const getFileIcon = (file) => {
    if (!file) return Upload;
    const type = file.type;
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('audio/')) return Music;
    return FileText;
  };

  const FileIcon = getFileIcon(selectedFile);

  return (
    <div className="w-full">
      <div
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ease-out will-change-transform
          ${dragActive
            ? 'border-primary-400 bg-primary-50/80 dark:border-primary-400 dark:bg-primary-900/20 shadow-[0_18px_40px_rgba(124,58,237,0.25)] scale-[1.01]'
            : 'border-gray-300 dark:border-gray-700 hover:border-secondary-300 dark:hover:border-secondary-400 hover:bg-surface-50/80 dark:hover:bg-gray-800/60'}
          ${selectedFile ? 'bg-surface-50 dark:bg-gray-800/80' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        {selectedFile ? (
          <div className="flex items-center justify-center gap-4">
            <FileIcon className="h-10 w-10 text-primary-600 dark:text-primary-400" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-12 w-12 text-secondary-400 dark:text-secondary-300" />
            <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">{label}</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">Max file size: {maxSize}MB</p>
          </>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-danger-500 dark:text-danger-400">{error}</p>
      )}
    </div>
  );
}

export default FileUpload;
