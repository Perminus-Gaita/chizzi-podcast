"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import Uppy from "@uppy/core";
import AwsS3 from "@uppy/aws-s3";

const SIZE_THRESHOLD = 100 * 1024 * 1024; // 100MB

const useUppyS3Upload = (options = {}) => {
  const { onUploadComplete, onUploadError } = options;
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const uppyRef = useRef(null);
  const activeUploadRef = useRef(null);

  const getUppy = useCallback(() => {
    if (!uppyRef.current) {
      uppyRef.current = new Uppy({
        autoProceed: false,
        allowMultipleUploadBatches: false,
        debug: true
      })
        .use(AwsS3, {
          shouldUseMultipart: (file) => file.size > SIZE_THRESHOLD,
          getUploadParameters: async (file) => {
            try {
              console.log('Getting upload parameters for file:', file.name);
              const response = await fetch("/api/media/s3/signed-url", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  filename: file.name,
                  fileType: file.type,
                }),
              });

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              const data = await response.json();
              return {
                method: "PUT",
                url: data.url,
                fields: {},
                headers: {
                  "Content-Type": file.type,
                },
              };
            } catch (error) {
              console.error("Error getting upload parameters:", error);
              throw error;
            }
          },
          createMultipartUpload: async (file) => {
            try {
              console.log('Initiating multipart upload for file:', file.name);
              const response = await fetch("/api/media/s3/multipart/initiate", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  filename: file.name,
                }),
              });

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              const data = await response.json();
              activeUploadRef.current = {
                uploadId: data.uploadId,
                key: data.key,
                parts: []
              };
              
              return {
                uploadId: data.uploadId,
                key: data.key,
              };
            } catch (error) {
              console.error("Error initiating multipart upload:", error);
              throw error;
            }
          },
          signPart: async (file, { uploadId, key, partNumber, signal }) => {
            if (isPaused) {
              await new Promise((resolve) => {
                const checkPause = () => {
                  if (!isPaused) {
                    resolve();
                  } else {
                    setTimeout(checkPause, 1000);
                  }
                };
                checkPause();
              });
            }

            try {
              console.log(`Signing part ${partNumber} for upload ${uploadId}`);
              const response = await fetch("/api/media/s3/multipart/sign-part", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  key,
                  uploadId,
                  partNumber,
                }),
              });

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              const data = await response.json();
              return {
                url: data.url,
              };
            } catch (error) {
              console.error(`Error signing part ${partNumber}:`, error);
              throw error;
            }
          },
          listParts: async (file, { uploadId, key }) => {
            try {
              console.log('Listing parts for upload:', { uploadId, key });
              const response = await fetch("/api/media/s3/multipart/list-parts", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  key,
                  uploadId,
                }),
              });

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              const data = await response.json();
              console.log('Listed parts:', data.parts);
              return data.parts;
            } catch (error) {
              console.error("Error listing parts:", error);
              throw error;
            }
          },
          completeMultipartUpload: async (file, { uploadId, key, parts }) => {
            try {
              console.log('Completing multipart upload:', { uploadId, key, parts });
              const response = await fetch("/api/media/s3/multipart/complete", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  key,
                  uploadId,
                  parts,
                }),
              });

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              const data = await response.json();
              activeUploadRef.current = null;
              return {
                location: data.location || `https://your-bucket.s3.amazonaws.com/${key}`,
              };
            } catch (error) {
              console.error("Error completing multipart upload:", error);
              throw error;
            }
          },
        });

      // Add event listeners
      uppyRef.current
        .on("upload-started", () => {
          console.log("Upload started");
          setIsUploading(true);
          setIsPaused(false);
        })
        .on("upload", () => {
          console.log("Upload event triggered");
          setIsUploading(true);
          setIsPaused(false);
        })
        .on("upload-progress", (file, progress) => {
          const percentage = Math.round(
            (progress.bytesUploaded / progress.bytesTotal) * 100
          );
          console.log(`Upload progress: ${percentage}%`);
          setProgress(percentage);
          setIsUploading(true);
        })
        .on("upload-success", (file, response) => {
          console.log('Upload successful:', file.name, response);
          setProgress(100);
          setIsUploading(false);
          setIsPaused(false);
          activeUploadRef.current = null;
          if (onUploadComplete) {
            onUploadComplete(response);
          }
        })
        .on("upload-error", (file, error) => {
          console.error("Upload error for file:", file.name, error);
          setIsUploading(false);
          setIsPaused(false);
          if (onUploadError) {
            onUploadError(error);
          }
        })
        .on("error", (error) => {
          console.error("Uppy error:", error);
          setIsUploading(false);
          setIsPaused(false);
          if (onUploadError) {
            onUploadError(error);
          }
        })
        .on("pause-all", () => {
          console.log("Upload paused");
          setIsPaused(true);
        })
        .on("resume-all", () => {
          console.log("Upload resumed");
          setIsPaused(false);
          setIsUploading(true);
        })
        .on("cancel-all", () => {
          console.log("Upload cancelled");
          setIsUploading(false);
          setIsPaused(false);
          setProgress(0);
          activeUploadRef.current = null;
        })
        .on("restriction-failed", (file, error) => {
          console.error("Restriction failed:", error);
          setErrorMessage(error.message);
        });
    }

    return uppyRef.current;
  }, [onUploadComplete, onUploadError, isPaused]);

  const upload = useCallback(async (file) => {
    const uppy = getUppy();
    setIsUploading(true);
    setProgress(0);
    setIsPaused(false);

    try {
      console.log('Starting upload for file:', file.name);
      uppy.cancelAll();
      
      uppy.addFile({
        name: file.name,
        type: file.type,
        data: file,
        source: 'Local',
        isRemote: false,
      });

      const result = await uppy.upload();
      console.log('Upload completed:', result);
      return result;
    } catch (error) {
      console.error('Upload failed:', error);
      setIsUploading(false);
      setIsPaused(false);
      throw error;
    }
  }, [getUppy]);

  const pauseUpload = useCallback(() => {
    if (uppyRef.current && isUploading) {
      console.log('Pausing upload');
      uppyRef.current.pauseAll();
      setIsPaused(true);
    }
  }, [isUploading]);

  const resumeUpload = useCallback(() => {
    if (uppyRef.current && isPaused) {
      console.log('Resuming upload');
      uppyRef.current.resumeAll();
      setIsPaused(false);
      setIsUploading(true);
    }
  }, [isPaused]);

  const cancelUpload = useCallback(async () => {
    if (uppyRef.current) {
      console.log('Cancelling upload');
      
      if (activeUploadRef.current) {
        try {
          await fetch("/api/media/s3/multipart/abort", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              key: activeUploadRef.current.key,
              uploadId: activeUploadRef.current.uploadId,
            }),
          });
        } catch (error) {
          console.error("Error aborting multipart upload:", error);
        }
      }
      
      uppyRef.current.cancelAll();
      activeUploadRef.current = null;
      setIsPaused(false);
      setIsUploading(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (uppyRef.current) {
        uppyRef.current.close();
      }
    };
  }, []);

  return {
    upload,
    pauseUpload,
    resumeUpload,
    cancelUpload,
    progress,
    isUploading,
    isPaused,
  };
};

export default useUppyS3Upload;