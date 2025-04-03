"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import axios from "axios";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
const SIZE_THRESHOLD = 10 * 1024 * 1024; // 10MB
const MAX_CONCURRENT_UPLOADS = 3; // Maximum number of simultaneous uploads

const useS3MultiUpload = () => {
  const activeUploads = useRef(new Map());
  const uploadQueue = useRef([]);
  const onProgressCallbacks = useRef(new Map());

  const getFileId = (file) => {
    if (file.url) return file.url;
    if (file.s3ObjectKey) return file.s3ObjectKey;
    if (!file._localId) {
      file._localId = `${Date.now()}-${file.name}-${file.lastModified}`;
    }
    return file._localId;
  };

  const uploadPart = async (fileId, uploadId, key, partNumber, chunk, abortController) => {
    try {
      const { data: signedUrl } = await axios.post("/api/media/s3/multipart/sign-part", {
        key,
        uploadId,
        partNumber,
      });

      const { headers } = await axios.put(signedUrl.url, chunk, {
        headers: { "Content-Type": "application/octet-stream" },
        onUploadProgress: (progressEvent) => {
          const uploadInfo = activeUploads.current.get(fileId);
          if (!uploadInfo) return;

          const partProgress = (progressEvent.loaded / progressEvent.total);
          const totalProgress = ((partNumber - 1) + partProgress) / uploadInfo.totalParts;
          const progressCallback = onProgressCallbacks.current.get(fileId);
          if (progressCallback) {
            progressCallback(fileId, Math.round(totalProgress * 100));
          }
        },
        signal: abortController.signal,
      });

      return { ETag: headers.etag, PartNumber: partNumber };
    } catch (error) {
      if (axios.isCancel(error)) throw error;
      throw error;
    }
  };

  const multipartUpload = async (file, fileId) => {
    const abortController = new AbortController();
    
    try {
      const { data: initData } = await axios.post("/api/media/s3/multipart/initiate", {
        filename: file.name,
      });

      const totalParts = Math.ceil(file.size / CHUNK_SIZE);
      const parts = Array.from({ length: totalParts }, (_, i) => ({
        PartNumber: i + 1,
        start: i * CHUNK_SIZE,
        end: Math.min((i + 1) * CHUNK_SIZE, file.size),
      }));

      activeUploads.current.set(fileId, {
        abortController,
        uploadId: initData.uploadId,
        key: initData.key,
        totalParts,
        completedParts: [],
      });

      for (const part of parts) {
        const chunk = file.slice(part.start, part.end);
        const completedPart = await uploadPart(
          fileId,
          initData.uploadId,
          initData.key,
          part.PartNumber,
          chunk,
          abortController
        );
        
        const uploadInfo = activeUploads.current.get(fileId);
        if (uploadInfo) {
          uploadInfo.completedParts.push(completedPart);
        }
      }

      await axios.post("/api/media/s3/multipart/complete", {
        key: initData.key,
        uploadId: initData.uploadId,
        parts: activeUploads.current.get(fileId)?.completedParts || [],
      });

      return initData;
    } catch (error) {
      if (axios.isCancel(error)) throw error;
      
      const uploadInfo = activeUploads.current.get(fileId);
      if (uploadInfo?.uploadId) {
        try {
          await axios.post("/api/media/s3/multipart/abort", {
            key: uploadInfo.key,
            uploadId: uploadInfo.uploadId,
          });
        } catch (abortError) {
          console.error('Error aborting multipart upload:', abortError);
        }
      }
      
      throw error;
    }
  };

  const normalUpload = async (file, fileId) => {
    const abortController = new AbortController();
    activeUploads.current.set(fileId, { abortController });

    try {
      const { data } = await axios.post("/api/media/s3/signed-url", {
        filename: file.name,
        fileType: file.type,
      });

      await axios.put(data.url, file, {
        headers: { "Content-Type": file.type },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          const progressCallback = onProgressCallbacks.current.get(fileId);
          if (progressCallback) {
            progressCallback(fileId, progress);
          }
        },
        signal: abortController.signal,
      });

      return { data };
    } catch (error) {
      throw error;
    }
  };

  const processNextInQueue = useCallback(async () => {
    while (activeUploads.current.size < MAX_CONCURRENT_UPLOADS && uploadQueue.current.length > 0) {
      const { file, fileId } = uploadQueue.current.shift();
      
      try {
        const result = file.size <= SIZE_THRESHOLD
          ? await normalUpload(file, fileId)
          : await multipartUpload(file, fileId);

        const progressCallback = onProgressCallbacks.current.get(fileId);
        if (progressCallback) {
          progressCallback(fileId, 100);
        }
      } catch (error) {
        if (!axios.isCancel(error)) {
          const progressCallback = onProgressCallbacks.current.get(fileId);
          if (progressCallback) {
            progressCallback(fileId, 0);
          }
          console.error('Upload failed:', error);
        }
      }

      activeUploads.current.delete(fileId);
      onProgressCallbacks.current.delete(fileId);
    }
  }, []);

  const upload = useCallback(async (files, onProgress) => {
    const fileArray = Array.isArray(files) ? files : [files];
    
    fileArray.forEach(file => {
      const fileId = getFileId(file);
      if (onProgress) {
        onProgressCallbacks.current.set(fileId, onProgress);
      }
      uploadQueue.current.push({ file, fileId });
    });

    processNextInQueue();
  }, [processNextInQueue]);

  const cancelUpload = useCallback((file) => {
    const fileId = getFileId(file);
    
    uploadQueue.current = uploadQueue.current.filter(item => item.fileId !== fileId);
    
    const uploadInfo = activeUploads.current.get(fileId);
    if (uploadInfo) {
      uploadInfo.abortController.abort();
      
      if (uploadInfo.uploadId) {
        axios.post("/api/media/s3/multipart/abort", {
          key: uploadInfo.key,
          uploadId: uploadInfo.uploadId,
        }).catch(error => {
          console.error('Error aborting multipart upload:', error);
        });
      }
      
      activeUploads.current.delete(fileId);
      onProgressCallbacks.current.delete(fileId);
    }

    processNextInQueue();
  }, [processNextInQueue]);

  useEffect(() => {
    return () => {
      activeUploads.current.forEach(({ abortController }) => {
        abortController.abort();
      });
      uploadQueue.current = [];
      onProgressCallbacks.current.clear();
    };
  }, []);

  return {
    upload,
    cancelUpload
  };
};

export default useS3MultiUpload;