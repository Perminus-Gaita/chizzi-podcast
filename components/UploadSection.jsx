"use client";

import { Image as ImageIcon } from "lucide-react";

const UploadSection = ({
  getRootProps,
  isDragActive,
  getInputProps,
  uploadType,
}) => {
  // const getRequirements = () => {
  //   if (uploadType === "table") {
  //     return {
  //       format: "JPG, PNG, or WebP",
  //       dimensions: "1920x1080px recommended",
  //       aspectRatio: "16:9",
  //       maxSize: "5MB",
  //     };
  //   }
  //   return {
  //     format: "PNG with transparency",
  //     dimensions: "500x750px recommended",
  //     aspectRatio: "2:3",
  //     maxSize: "2MB",
  //   };
  // };

  const getRequirements = () => {
    switch (uploadType) {
      case "table":
        return {
          format: "JPG, PNG, or WebP",
          dimensions: "1920x1080px recommended",
          aspectRatio: "16:9",
          maxSize: "5MB",
        };
      case "card":
        return {
          format: "PNG with transparency",
          dimensions: "500x750px recommended",
          aspectRatio: "2:3",
          maxSize: "2MB",
        };
      case "banner":
        return {
          format: "JPG, PNG, or WebP",
          dimensions: "1200x300px recommended",
          aspectRatio: "4:1",
          maxSize: "3MB",
        };
      default:
        return {
          format: "JPG, PNG, or WebP",
          dimensions: "1920x1080px recommended",
          aspectRatio: "16:9",
          maxSize: "5MB",
        };
    }
  };

  const requirements = getRequirements();

  // const getUploadText = () => {
  //   if (isDragActive) {
  //     return `Drop your ${
  //       uploadType === "table" ? "background" : "card skin"
  //     } here`;
  //   }
  //   return uploadType === "table"
  //     ? "Upload Table Background"
  //     : "Upload Card Skin";
  // };

  const getUploadText = () => {
    if (isDragActive) {
      switch (uploadType) {
        case "table":
          return "Drop your background here";
        case "card":
          return "Drop your card skin here";
        case "banner":
          return "Drop your banner here";
        default:
          return "Drop your image here";
      }
    }

    switch (uploadType) {
      case "table":
        return "Upload Table Background";
      case "card":
        return "Upload Card Skin";
      case "banner":
        return "Upload Tournament Banner";
      default:
        return "Upload Image";
    }
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6
          transition-colors duration-200 ease-in-out
          ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-gray-300 hover:border-primary"
          }
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-4">
          <ImageIcon className="h-12 w-12 text-muted-foreground" />

          <div className="text-center">
            <p className="text-sm font-medium">{getUploadText()}</p>
            <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
              <p>{requirements.format}</p>
              <p>{requirements.dimensions}</p>
              <p>{requirements.aspectRatio} aspect ratio</p>
              <p>Maximum {requirements.maxSize}</p>
            </div>
          </div>
        </div>
      </div>

      {isDragActive && (
        <div className="text-center text-sm text-muted-foreground">
          Release to upload
        </div>
      )}
    </div>
  );
};

export default UploadSection;
