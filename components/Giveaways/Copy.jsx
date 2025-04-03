"use client";
import { useState } from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import { useDispatch } from "react-redux";
import { createNotification } from "@/app/store/notificationSlice";

const Copy = () => {
  const dispatch = useDispatch();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    // Copy the URL to the clipboard
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        setCopied(true);
        // console.log("URL copied to clipboard:", window.location.href);

        dispatch(
          createNotification({
            open: true,
            type: "info",
            message: "URL Copied to clipboard.",
          })
        );

        setTimeout(() => {
          setCopied(false);
        }, 3000);
      })
      .catch((error) => {
        return;
        // console.error("Error copying to clipboard:", error);
      });
  };

  return (
    <div>
      {copied ? (
        <button>
          <CheckCircleOutlineOutlinedIcon
            sx={{
              color: "#78d64b",
              fontSize: "1.5rem",
            }}
          />
        </button>
      ) : (
        <button onClick={() => copyToClipboard()}>
          <ContentCopyIcon
            sx={{
              color: "#fff",
              fontSize: "1.5rem",
            }}
          />
        </button>
      )}
    </div>
  );
};

export default Copy;
