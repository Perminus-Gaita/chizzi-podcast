"use client";
import { useState } from 'react';
import useS3Upload from '../../../lib/media/use-s3-upload';
import { Card, Input, Button, Typography, LinearProgress, Snackbar } from "@mui/material";

const UploadClient = () => {
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const { upload, pauseUpload, resumeUpload, cancelUpload, progress, isPaused, isUploading } = useS3Upload();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (file) {
      try {
        console.log('Starting upload');
        await upload(file);
        console.log('Upload completed');
        setErrorMessage("Upload completed successfully");
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
      />
      <Button variant="contained" onClick={handleUpload} sx={{ mr: 2 }} disabled={isUploading && !isPaused}>Upload</Button>
      <Button variant="contained" onClick={pauseUpload} sx={{ mr: 2 }} disabled={!isUploading || isPaused}>Pause</Button>
      <Button variant="contained" onClick={resumeUpload} sx={{ mr: 2 }} disabled={!isPaused}>Resume</Button>
      <Button variant="contained" onClick={cancelUpload} disabled={!isUploading && !isPaused}>Cancel</Button>
      <LinearProgress variant="determinate" value={progress} sx={{ mt: 2 }} />
      <Typography variant="body2" sx={{ mt: 1 }}>
        Progress: {progress}% | Status: {getStatus()}
      </Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>
        isPaused: {isPaused.toString()} | isUploading: {isUploading.toString()}
      </Typography>
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage('')}
        message={errorMessage}
      />
    </Card>
  );
};

export default UploadClient;
