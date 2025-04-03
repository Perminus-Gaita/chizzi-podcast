import React, { useCallback, useState } from "react";
import { Image as ImageIcon, X, Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const ProductImageUpload = ({
  onImageUpload,
  imageFile,
  setImageFile,
  setPreviewImage,
  previewImage,
  setError,
  error,
  clearImage,
  tournamentId
}) => {
  const validateFile = (file) => {
    // Reduced to 5MB from 10MB
    if (file.size > 5 * 1024 * 1024) return "File size must be less than 5MB";
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return "File must be an image (JPEG, PNG, WEBP)";
    }
    return null;
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const errorMessage = validateFile(file);
    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    setError("");
    setImageFile(file);
    setPreviewImage(URL.createObjectURL(file));
    
    // Instead of uploading to S3 directly, we'll prepare the file for form submission
    // Convert the file to base64 for server-side upload
    const reader = new FileReader();
    reader.onload = (event) => {
      // Extract the base64 data part (remove the data:image/jpeg;base64, prefix)
      const base64String = event.target.result.split(',')[1];
      
      // Pass the file data to the parent component for later server upload
      onImageUpload({
        name: file.name,
        type: file.type,
        content: base64String
      });
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    multiple: false,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
  });

  return (
    <div className="space-y-4">
      <Label>Product Image</Label>
      {previewImage ? (
        <div className="relative">
          <img
            src={previewImage}
            alt="Preview"
            className="w-full h-48 object-contain rounded-lg"
          />
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-black/20 hover:bg-black/30 text-white"
            onClick={clearImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-4
            transition-colors duration-200 ease-in-out
            flex flex-col items-center justify-center gap-2
            cursor-pointer h-48
            ${isDragActive
                ? "border-primary bg-primary/5"
                : "border-gray-300 hover:border-primary"
            }
          `}
        >
          <input {...getInputProps()} />
          <ImageIcon className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-center text-muted-foreground">
            {isDragActive ? "Drop image here" : "Drop image or click to browse"}
          </p>
          <p className="text-xs text-muted-foreground">Max size: 5MB</p>
        </div>
      )}
      
      {error && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ProductImageUpload;