"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import Uppy from "@uppy/core";
import AwsS3 from "@uppy/aws-s3";
// import { addMediaFiles } from "@/app/store/create-posts-forms/content-slice";
// import {
//   updateUploadProgress,
//   clearUploadProgress,
//   startUpload  // Add this
// } from "@/app/store/create-posts-forms/ui-slice";

const SIZE_THRESHOLD = 100 * 1024 * 1024; // 100MB

const useUppyS3Upload = (options = {}) => {
  const { customConfig = {} } = options;
  const dispatch = useDispatch();

  const [uploads, setUploads] = useState(new Map());
  const [isUploading, setIsUploading] = useState(false);
  const uppyRef = useRef(null);
  const processedFiles = useRef(new Set());
  const completionTimers = useRef(new Map());

  const cleanupCompletionTimer = useCallback((fileId) => {
    if (completionTimers.current.has(fileId)) {
      clearTimeout(completionTimers.current.get(fileId));
      completionTimers.current.delete(fileId);
    }
  }, []);

  const getUploadParameters = async (file) => {
    try {
      if (file.size > SIZE_THRESHOLD) {
        const response = await fetch("/api/media/s3/multipart/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            fileType: file.type,
            size: file.size,
          }),
        });

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const { uploadId, key } = await response.json();

        return {
          method: "POST",
          uploadId,
          key,
          fields: {},
          headers: { "Content-Type": file.type },
        };
      } else {
        const response = await fetch("/api/media/s3/signed-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            fileType: file.type,
          }),
        });

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        return {
          method: "PUT",
          url: data.url,
          fields: {},
          headers: { "Content-Type": file.type },
        };
      }
    } catch (error) {
      console.error("Error getting upload parameters:", error);
      throw error;
    }
  };

  const signPart = async (file, { uploadId, key, partNumber }) => {
    try {
      const response = await fetch("/api/media/s3/multipart/sign-part", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, uploadId, partNumber }),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const { url } = await response.json();
      return { url };
    } catch (error) {
      console.error(`Error signing part ${partNumber}:`, error);
      throw error;
    }
  };

  const completeMultipartUpload = async (file, { uploadId, key, parts }) => {
    try {
      const response = await fetch("/api/media/s3/multipart/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, uploadId, parts }),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      return {
        location: `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${key}`,
      };
    } catch (error) {
      console.error("Error completing multipart upload:", error);
      throw error;
    }
  };

  const getUppy = useCallback(() => {
    // if (!uppyRef.current) {
    //   uppyRef.current = new Uppy({
    //     autoProceed: true,
    //     allowMultipleUploadBatches: true,
    //     debug: process.env.NODE_ENV === 'development',
    //     restrictions: {
    //       maxNumberOfFiles: null,
    //       allowedFileTypes: null
    //     },
    //     ...customConfig
    //   }).use(AwsS3, {
    //     shouldUseMultipart: (file) => file.size > SIZE_THRESHOLD,
    //     getUploadParameters,
    //     signPart,
    //     completeMultipartUpload,
    //   });

    //   uppyRef.current
    //   .on("file-added", (file) => {
    //     console.log({"file added":file});
    //     const fileId = file.meta.fileId || file.id;

    //     // Dispatch startUpload first to initialize the tracking
    //     dispatch(startUpload(fileId));
    //     dispatch(updateUploadProgress({ fileId, progress: 0 }));

    //     setUploads(prev => new Map(prev).set(fileId, {
    //       id: fileId,
    //       name: file.name,
    //       progress: 0,
    //       status: 'waiting'
    //     }));
    //   })
    //     .on("upload-started", () => {
    //       setIsUploading(true);
    //     })
    //     .on("upload-progress", (file, progress) => {
    //       const fileId = file.meta.fileId || file.id;
    //       const percentage = Math.round(
    //         (progress.bytesUploaded / progress.bytesTotal) * 100
    //       );

    //       dispatch(updateUploadProgress({ fileId, progress: percentage }));

    //       setUploads(prev => {
    //         const newMap = new Map(prev);
    //         const currentFile = newMap.get(fileId);
    //         if (currentFile && currentFile.status !== 'complete') {
    //           newMap.set(fileId, {
    //             ...currentFile,
    //             progress: percentage,
    //             status: 'uploading'
    //           });
    //         }
    //         return newMap;
    //       });
    //     })
    //     .on("upload-success", (file, response) => {
    //       const fileId = file.meta.fileId || file.id;

    //       dispatch(clearUploadProgress(fileId));
    //       dispatch(addMediaFiles([{
    //         id: fileId,
    //         file: file.data,
    //         url: response.location || response.uploadURL,
    //         type: file.type,
    //         isUploaded: true
    //       }]));

    //       setUploads(prev => {
    //         const newMap = new Map(prev);
    //         newMap.set(fileId, {
    //           ...newMap.get(fileId),
    //           progress: 100,
    //           status: 'complete',
    //           response
    //         });
    //         return newMap;
    //       });

    //       cleanupCompletionTimer(fileId);
    //       const timerId = setTimeout(() => {
    //         setUploads(prev => {
    //           const newMap = new Map(prev);
    //           newMap.delete(fileId);
    //           return newMap;
    //         });
    //         completionTimers.current.delete(fileId);
    //       }, 2000);
    //       completionTimers.current.set(fileId, timerId);
    //     })
    //     .on("upload-error", (file, error) => {
    //       const fileId = file.meta.fileId || file.id;
    //       console.error('Upload error:', error);

    //       dispatch(clearUploadProgress(fileId));

    //       setUploads(prev => {
    //         const newMap = new Map(prev);
    //         newMap.set(fileId, {
    //           ...newMap.get(fileId),
    //           status: 'error',
    //           error: error.message
    //         });
    //         return newMap;
    //       });

    //       cleanupCompletionTimer(fileId);
    //     });
    // }

    return uppyRef.current;
  }, [dispatch, customConfig, cleanupCompletionTimer]);

  const addFiles = useCallback(
    (files) => {
      const uppy = getUppy();
      const duplicateFiles = [];

      Array.from(files).forEach((file) => {
        try {
          if (!file.data || !file.name) {
            console.error("Invalid file structure:", file);
            return;
          }

          const fileId =
            file.meta?.fileId ||
            `uppy-file-${Date.now()}-${file.name.replace(
              /[^a-zA-Z0-9]/g,
              "-"
            )}-${file.data.size}`;

          if (processedFiles.current.has(fileId)) {
            duplicateFiles.push(file);
            return;
          }

          uppy.addFile({
            name: file.name,
            type: file.type,
            data: file.data,
            source: "Local",
            isRemote: false,
            meta: {
              fileId: file.meta?.fileId || fileId,
            },
          });

          processedFiles.current.add(fileId);
        } catch (error) {
          console.error(`Error adding file ${file.name}:`, error);
        }
      });

      return duplicateFiles;
    },
    [getUppy]
  );

  const cancelUpload = useCallback(
    (fileId) => {
      if (uppyRef.current) {
        uppyRef.current.removeFile(fileId);
        // dispatch(clearUploadProgress(fileId));
        cleanupCompletionTimer(fileId);

        setUploads((prev) => {
          const newMap = new Map(prev);
          newMap.delete(fileId);
          return newMap;
        });

        processedFiles.current.delete(fileId);
      }
    },
    [dispatch, cleanupCompletionTimer]
  );

  useEffect(() => {
    return () => {
      if (uppyRef.current) {
        completionTimers.current.forEach((timerId) => {
          clearTimeout(timerId);
        });
        completionTimers.current.clear();

        uppyRef.current.off();
        uppyRef.current = null;
      }
    };
  }, []);

  return {
    addFiles,
    cancelUpload,
    uploads,
    isUploading,
    processedFiles: processedFiles.current,
  };
};

export default useUppyS3Upload;
