"use client";
import { useState, useCallback } from 'react';
import useUppyS3Upload from '../../../lib/media/use-uppy-s3-upload';
import { Card, Typography, LinearProgress, IconButton } from "@mui/material";
import { X, Upload } from "lucide-react";

export default function CustomDragDropUploader() {
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { 
    addFiles,
    uploads,
    isUploading,
  } = useUppyS3Upload({
    mode: 'multiple',
    onUploadComplete: (result) => {
      console.log('Upload complete:', result);
    },
    onUploadError: (error) => {
      console.error('Upload error:', error);
      setErrorMessage(error.message);
    },
    customConfig: {
      restrictions: {
        maxNumberOfFiles: null,
        allowedFileTypes: ['image/*', 'video/*']
      }
    }
  });

  // Create file preview
  const createFilePreview = useCallback((file) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file.data);
    }
    return '/api/placeholder/150/150';
  }, []);

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  // Handle drop event
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }, [addFiles]);

  // Handle manual file selection
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
  };

  const handleCancel = (fileId) => {
    const file = uploads.get(fileId);
    if (file?.preview && file.preview.startsWith('blob:')) {
      URL.revokeObjectURL(file.preview);
    }
    // The cancel functionality is now handled by the hook
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-300 ease-in-out mb-8
          ${dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          accept="image/*,video/*"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <Typography variant="h6" className="mt-2">
            Drag & drop media files here or click to select
          </Typography>
          <Typography variant="body2" className="text-gray-500">
            Supports multiple images and videos
          </Typography>
        </label>
      </div>

      {/* Upload Previews Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from(uploads?.entries() || []).map(([id, file]) => (
          <Card key={id} className="relative">
            <div className="relative pt-[100%]">
              <img
                src={file.preview || createFilePreview(file)}
                alt={file.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center p-2">
                <Typography variant="caption" className="text-white mb-2 text-center truncate w-full">
                  {file.name}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={file.progress || 0}
                  className="w-full mb-1"
                />
                <Typography variant="caption" className="text-white">
                  {file.status === 'complete' 
                    ? 'Complete' 
                    : file.status === 'error'
                    ? 'Error'
                    : `${file.progress || 0}%`
                  }
                </Typography>
              </div>
              <IconButton 
                className="absolute top-1 right-1 bg-white hover:bg-gray-100"
                size="small"
                onClick={() => handleCancel(id)}
                disabled={file.status === 'complete'}
              >
                <X size={16} />
              </IconButton>
            </div>
          </Card>
        ))}
      </div>

      {errorMessage && (
        <Typography color="error" className="mt-4">
          {errorMessage}
        </Typography>
      )}
    </div>
  );
}