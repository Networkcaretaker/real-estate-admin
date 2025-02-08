import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

interface FileWithPreview extends File {
  preview?: string;
}

interface ImageUploaderProps {
  propertyId: string;
  onUploadComplete: (imageIds: string[]) => void;
  onError: (error: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ propertyId, onUploadComplete, onError }) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const onDrop = useCallback((acceptedFiles: Array<File>) => {
    const newFiles = acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const handleRemoveFile = useCallback((fileToRemove: FileWithPreview) => {
    setFiles(currentFiles => currentFiles.filter(file => file !== fileToRemove));
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
  }, []);

  const handleUploadFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    const uploadedImageIds: string[] = [];

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('files', file);

        const response = await axios.post(
          `${API_URL}/properties/${propertyId}/images`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                setUploadProgress(prev => ({
                  ...prev,
                  [file.name]: percentCompleted
                }));
              }
            }
          }
        );

        uploadedImageIds.push(...response.data.map((img: any) => img.id));
      }

      // Clean up after successful upload
      files.forEach(file => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
      setFiles([]);
      setUploadProgress({});
      onUploadComplete(uploadedImageIds);

    } catch (error) {
      if (axios.isAxiosError(error)) {
        onError(error.response?.data?.message || 'Upload failed');
      } else {
        onError('Upload failed');
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? 'Drop the images here...'
            : 'Drag and drop images here, or click to select files'}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Only JPG and PNG files up to 10MB
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {files.map((file) => (
              <div key={file.name} className="relative">
                <img
                  src={file.preview}
                  alt={file.name}
                  className="h-32 w-full rounded-lg object-cover"
                />
                <button
                  onClick={() => handleRemoveFile(file)}
                  className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
                {uploadProgress[file.name] !== undefined && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${uploadProgress[file.name]}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleUploadFiles}
              disabled={isUploading}
              className={`
                rounded px-4 py-2 text-white
                ${isUploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'}
              `}
            >
              {isUploading ? 'Uploading...' : 'Upload Images'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;