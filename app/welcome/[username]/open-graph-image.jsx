import { ImageResponse } from "next/og";
import { userDatabase } from "./page";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Generate dynamic OG images for each user profile
export default async function Image({ params }) {
  const { username } = params;
  const user = userDatabase[username];

  // Handle user not found
  if (!user) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: "#f5f5f5",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#333",
          }}
        >
          <div>User Not Found</div>
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 32,
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* Header background image */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "300px",
            backgroundImage: `url(${user.headerImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.7)",
            zIndex: 1,
          }}
        />

        {/* Content container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            padding: "0 40px",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Profile image */}
          <div
            style={{
              width: "180px",
              height: "180px",
              borderRadius: "90px",
              border: "6px solid white",
              backgroundImage: `url(${user.avatar})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              marginBottom: "20px",
            }}
          />

          {/* User info */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "rgba(255, 255, 255, 0.9)",
              padding: "24px 48px",
              borderRadius: "16px",
            }}
          >
            <h1
              style={{ fontSize: "60px", margin: "0 0 8px 0", color: "#000" }}
            >
              {user.displayName}
            </h1>
            <p style={{ fontSize: "32px", margin: "0", color: "#555" }}>
              @{user.username}
            </p>
            <div style={{ marginTop: "24px", fontSize: "24px", color: "#333" }}>
              View profile on Wufwuf
            </div>
          </div>
        </div>

        {/* Branding */}
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            right: "20px",
            fontSize: "24px",
            color: "white",
            background: "rgba(0, 0, 0, 0.7)",
            padding: "8px 16px",
            borderRadius: "8px",
            zIndex: 3,
          }}
        >
          wufwuf.io
        </div>
      </div>
    ),
    { ...size }
  );
}
