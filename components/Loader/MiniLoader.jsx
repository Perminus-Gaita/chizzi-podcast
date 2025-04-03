// "use client";
// import Image from "next/image";
// import { Box } from "@mui/material";

// import styles from "../../styles/miniloader.module.css";

// const MiniLoader = () => {
//   return (
//     <div className={styles.lds_ripple}>
//       <div></div>
//       <div></div>
//     </div>
//   );
// };

// export default MiniLoader;

import React from "react";

const MiniLoader = ({ size = "default", className = "" }) => {
  // Size variants mapping
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    default: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-3",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`
          ${sizeClasses[size]}
          rounded-full
          border-primary/30
          border-t-primary
          animate-[spin_0.6s_linear_infinite]
          motion-reduce:animate-[spin_1.5s_linear_infinite]
          ${className}
        `}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

// Optional secondary export for a variant with text
export const MiniLoaderWithText = ({
  size = "default",
  text = "Loading",
  className = "",
}) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <MiniLoader size={size} className={className} />
      <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
    </div>
  );
};

export default MiniLoader;
