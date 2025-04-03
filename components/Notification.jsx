"use client";
import { Snackbar, IconButton, Card, Box, Typography } from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";

import { useDispatch, useSelector } from "react-redux";
import { createNotification } from "@/app/store/notificationSlice";

const Notification = ({
  isOpenNotification,
  metadataError,
  setIsOpenNotification,
}) => {
  const dispatch = useDispatch();

  const isOpen = useSelector((state) => state.notification.open);
  const type = useSelector((state) => state.notification.type);
  const message = useSelector((state) => state.notification.message);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setIsOpenNotification(false);
  };

  const closeNotification = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    console.log("closing notif");

    dispatch(
      createNotification({
        open: false,
        type: "",
        message: "",
      })
    );
  };

  const action = (
    <>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </>
  );

  const notificationAction = (
    <>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={closeNotification}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </>
  );

  return (
    <div>
      <Snackbar
        open={isOpenNotification}
        autoHideDuration={4000}
        onClose={handleClose}
        message={metadataError}
        action={action}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      />

      <Snackbar
        open={isOpen}
        // open={true}
        autoHideDuration={4000}
        onClose={closeNotification}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        style={{ marginTop: "60px" }}
      >
        <Card
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor:
              type === "success"
                ? "#78d64b"
                : type === "error"
                ? "#ff5733"
                : type === "info"
                ? "#faca00"
                : "#9f9f9f",
            padding: "5px 16px",
            minWidth: "300px",
            minHeight: "45px",
            borderRadius: "10px",
            position: "relative",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            {/* Add your checkcircle icon here */}
            {type === "success" && (
              <CheckCircleIcon
                fontSize="small"
                style={{
                  marginRight: "8px",
                  color: "#1c1c1c",
                  width: "25px",
                  height: "25px",
                }}
              />
            )}
            {type === "error" && (
              <ErrorIcon
                fontSize="small"
                style={{
                  marginRight: "8px",
                  color: "#1c1c1c",
                  width: "25px",
                  height: "25px",
                }}
              />
            )}

            {type === "info" && (
              <InfoIcon
                fontSize="small"
                style={{
                  marginRight: "8px",
                  color: "#1c1c1c",
                  width: "25px",
                  height: "25px",
                }}
              />
            )}

            {/* Snackbar message */}
            <Typography
              variant="caption"
              sx={{ color: "#fff", fontWeight: "600" }}
            >
              {message}
            </Typography>
          </Box>
          {/* Close button */}
          <IconButton
            // sx={{ position: "absolute", right: "2%" }}
            size="small"
            aria-label="close"
            onClick={closeNotification}
          >
            <CloseIcon fontSize="small" sx={{ color: "#1c1c1c" }} />
          </IconButton>
        </Card>
      </Snackbar>
    </div>
  );
};

export default Notification;
