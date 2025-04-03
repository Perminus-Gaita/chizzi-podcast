"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import axios from "axios";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
const SIZE_THRESHOLD = 10 * 1024 * 1024; // 10MB

const useS3Upload = () => {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const uploadState = useRef({
    file: null,
    uploadId: null,
    key: null,
    parts: [],
    totalParts: 0,
    completedParts: [],
    currentPartNumber: 1,
  });
  const abortController = useRef(new AbortController());

  const log = (message) => {
    console.log(`[S3Upload] ${message}`);
  };

  const resetAbortController = () => {
    abortController.current = new AbortController();
    log("AbortController reset");
  };

  const calculateParts = (file) => {
    const totalParts = Math.ceil(file.size / CHUNK_SIZE);
    return Array.from({ length: totalParts }, (_, i) => ({
      PartNumber: i + 1,
      start: i * CHUNK_SIZE,
      end: Math.min((i + 1) * CHUNK_SIZE, file.size),
    }));
  };

  const uploadPart = async (partNumber, chunk) => {
    log(`Uploading part ${partNumber}`);
    try {
      const { data: signedUrl } = await axios.post(
        "/api/media/s3/multipart/sign-part",
        {
          key: uploadState.current.key,
          uploadId: uploadState.current.uploadId,
          partNumber,
        }
      );

      const { headers } = await axios.put(signedUrl.url, chunk, {
        headers: { "Content-Type": "application/octet-stream" },
        onUploadProgress: (progressEvent) => {
          const totalProgress =
            (partNumber - 1) / uploadState.current.totalParts +
            progressEvent.loaded /
              progressEvent.total /
              uploadState.current.totalParts;
          setProgress(Math.round(totalProgress * 100));
        },
        signal: abortController.current.signal,
      });

      log(`Part ${partNumber} uploaded successfully`);
      return { ETag: headers.etag, PartNumber: partNumber };
    } catch (error) {
      if (axios.isCancel(error)) {
        log(`Part ${partNumber} upload cancelled`);
        throw error;
      }
      log(`Error uploading part ${partNumber}: ${error.message}`);
      throw error;
    }
  };

  const multipartUpload = async (file) => {
    log("Starting or resuming multipart upload");
    try {
      if (!uploadState.current.uploadId) {
        const { data: initData } = await axios.post(
          "/api/media/s3/multipart/initiate",
          {
            filename: file.name,
          }
        );
        uploadState.current = {
          ...uploadState.current,
          file,
          uploadId: initData.uploadId,
          key: initData.key,
          parts: calculateParts(file),
          totalParts: Math.ceil(file.size / CHUNK_SIZE),
          completedParts: [],
          currentPartNumber: 1,
        };
        log(
          `Multipart upload initiated. UploadId: ${initData.uploadId}, TotalParts: ${uploadState.current.totalParts}`
        );
      }

      while (
        uploadState.current.currentPartNumber <= uploadState.current.totalParts
      ) {
        if (isPaused) {
          log("Upload paused");
          return;
        }

        const part =
          uploadState.current.parts[uploadState.current.currentPartNumber - 1];
        const chunk = uploadState.current.file.slice(part.start, part.end);

        try {
          const completedPart = await uploadPart(part.PartNumber, chunk);
          uploadState.current.completedParts.push(completedPart);
          uploadState.current.currentPartNumber++;
        } catch (error) {
          if (axios.isCancel(error)) {
            log("Upload cancelled");
            return;
          }
          throw error;
        }
      }

      if (!isPaused) {
        log("All parts uploaded, completing multipart upload");
        await axios.post("/api/media/s3/multipart/complete", {
          key: uploadState.current.key,
          uploadId: uploadState.current.uploadId,
          parts: uploadState.current.completedParts,
        });

        setProgress(100);
        log("Multipart upload completed successfully");
        resetUploadState();
      }
    } catch (error) {
      log(`Error during multipart upload: ${error.message}`);
      throw error;
    }
  };

  // const normalUpload = async (file) => {
  //     log('Starting normal upload');
  //     try {
  //         const { data } = await axios.post('/api/media/s3/signed-url', {
  //             filename: file.name,
  //             fileType: file.type
  //         });

  //         log(`Received signed URL: ${data.url}`);

  //         const uploadPromise = axios.put(data.url, file, {
  //             headers: { 'Content-Type': file.type },
  //             onUploadProgress: (progressEvent) => {
  //                 const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
  //                 setProgress(percentCompleted);
  //                 log(`Upload progress: ${percentCompleted}%`);
  //             },
  //             signal: abortController.current.signal,
  //         });

  //         log('Initiating file upload to S3');
  //         await uploadPromise;

  //         log('Normal upload completed successfully');
  //         setProgress(100);
  //     } catch (error) {
  //         if (axios.isCancel(error)) {
  //             log('Normal upload cancelled');
  //             throw error; // Re-throw to be caught in the main upload function
  //         } else {
  //             log(`Error during normal upload: ${error.message}`);
  //             console.error('Full error object:', error);
  //             throw error;
  //         }
  //     }
  // };

  const normalUpload = async (file) => {
    try {
      const { data } = await axios.post("/api/media/s3/signed-url", {
        filename: file.name,
        fileType: file.type,
      });

      await axios.put(data.url, file, {
        headers: { "Content-Type": file.type },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
        signal: abortController.current.signal,
      });

      setProgress(100);
      return { data }; // Return the key
    } catch (error) {
      throw error;
    }
  };

  //   const upload = useCallback(async (file) => {
  //     log(`Starting upload for file: ${file.name}, size: ${file.size} bytes`);
  //     setIsUploading(true);
  //     uploadState.current.file = file;
  //     resetAbortController(); // Reset the abort controller before starting the upload

  //     try {
  //       if (file.size <= SIZE_THRESHOLD) {
  //         log("Using normal upload for small file");
  //         await normalUpload(file);
  //       } else {
  //         log("Using multipart upload");
  //         await multipartUpload(file);
  //       }
  //       log("Upload completed successfully");
  //     } catch (error) {
  //       if (axios.isCancel(error)) {
  //         log("Upload aborted by user");
  //       } else {
  //         log(`Upload failed: ${error.message}`);
  //         console.error("Full error object:", error);
  //       }
  //     } finally {
  //       setIsUploading(false);
  //       setIsPaused(false);
  //     }
  //   }, []);

  const upload = useCallback(async (file) => {
    setIsUploading(true);
    uploadState.current.file = file;
    resetAbortController();

    try {
      const result =
        file.size <= SIZE_THRESHOLD
          ? await normalUpload(file)
          : await multipartUpload(file);
      return result; // Return the result containing the key
    } catch (error) {
      throw error;
    } finally {
      setIsUploading(false);
      setIsPaused(false);
    }
  }, []);

  const pauseUpload = useCallback(() => {
    log("Pausing upload");
    setIsPaused(true);
    abortController.current.abort();
  }, []);

  const resumeUpload = useCallback(() => {
    log("Resuming upload");
    setIsPaused(false);
    setIsUploading(true);
    resetAbortController();
    multipartUpload(uploadState.current.file);
  }, []);

  const cancelUpload = useCallback(async () => {
    log("Cancelling upload");
    abortController.current.abort();
    if (uploadState.current.uploadId) {
      try {
        await axios.post("/api/media/s3/multipart/abort", {
          key: uploadState.current.key,
          uploadId: uploadState.current.uploadId,
        });
        log("Multipart upload aborted on server");
      } catch (error) {
        log(`Error aborting multipart upload: ${error.message}`);
      }
    }
    resetUploadState();
    setProgress(0);
    setIsUploading(false);
    setIsPaused(false);
  }, []);

  const resetUploadState = () => {
    log("Resetting upload state");
    uploadState.current = {
      file: null,
      uploadId: null,
      key: null,
      parts: [],
      totalParts: 0,
      completedParts: [],
      currentPartNumber: 1,
    };
  };

  useEffect(() => {
    return () => {
      abortController.current.abort();
    };
  }, []);

  return {
    upload,
    pauseUpload,
    resumeUpload,
    cancelUpload,
    progress,
    isPaused,
    isUploading,
  };
};

export default useS3Upload;
