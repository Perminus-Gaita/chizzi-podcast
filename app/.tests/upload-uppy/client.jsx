"use client";
import { useState } from 'react';
import useUppyS3Upload from '../../../lib/media/use-uppy-s3-upload';
import { Card, Input, Button, Typography, LinearProgress, Snackbar } from "@mui/material";

const UploadClient = () => {
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const { 
    upload, 
    pauseUpload, 
    resumeUpload, 
    cancelUpload, 
    progress, 
    isPaused, 
    isUploading 
  } = useUppyS3Upload({
    mode: 'single', // Explicitly set single upload mode
    onUploadComplete: (result) => {
      setErrorMessage("Upload completed successfully");
      console.log('Upload result:', result);
    },
    onUploadError: (error) => {
      setErrorMessage(`Upload failed: ${error.message}`);
      console.error('Upload failed:', error);
    },
    customConfig: {
      restrictions: {
        maxNumberOfFiles: 1,
        allowedFileTypes: null // Allow all file types, or specify types like ['image/*', 'video/*']
      }
    }
  });

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (file) {
      try {
        console.log('Starting upload');
        await upload(file);
        console.log('Upload completed');
      } catch (error) {
        console.error('Upload failed:', error);
        setErrorMessage(`Upload failed: ${error.message}`);
      }
    } else {
      setErrorMessage("Please select a file first.");
    }
  };

  const getStatus = () => {
    if (isUploading && !isPaused) return 'Uploading';
    if (isPaused) return 'Paused';
    if (progress === 100) return 'Completed';
    return 'Idle';
  };

  return (
    <Card sx={{ p: 3, maxWidth: 600, margin: "auto", mt: 4 }}>
      <Typography variant="h5" gutterBottom>S3 File Upload</Typography>
      <Input
        type="file"
        onChange={handleFileChange}
        sx={{ mb: 2 }}
        disabled={isUploading}
        inputProps={{
          accept: '*/*' // Or specify accepted file types
        }}
      />
      <Button 
        variant="contained" 
        onClick={handleUpload} 
        sx={{ mr: 2 }} 
        disabled={!file || (isUploading && !isPaused)}
      >
        Upload
      </Button>
      <Button 
        variant="contained" 
        onClick={pauseUpload} 
        sx={{ mr: 2 }} 
        disabled={!isUploading || isPaused}
      >
        Pause
      </Button>
      <Button 
        variant="contained" 
        onClick={resumeUpload} 
        sx={{ mr: 2 }} 
        disabled={!isPaused}
      >
        Resume
      </Button>
      <Button 
        variant="contained" 
        onClick={cancelUpload}
        color="secondary" 
        disabled={!isUploading && !isPaused}
      >
        Cancel
      </Button>
      
      <LinearProgress 
        variant="determinate" 
        value={progress || 0} // Add fallback for null/undefined
        sx={{ mt: 2 }} 
      />
      
      <Typography variant="body2" sx={{ mt: 1 }}>
        Progress: {progress || 0}% | Status: {getStatus()}
      </Typography>
      
      <Typography variant="body2" sx={{ mt: 1 }}>
        Is Paused: {isPaused.toString()} | Is Uploading: {isUploading.toString()}
      </Typography>
      
      {file && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          Selected File: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
        </Typography>
      )}
      
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage('')}
        message={errorMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Card>
  );
};

export default UploadClient;