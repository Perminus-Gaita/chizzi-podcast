import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUserSession } from "@/services/auth/get-user-session";
import { createAWorkspaceDocument } from "@/services/workspace/create-a-workspace-document";
import { changeUserCurrentWorkspace } from "@/services/user/change-user-current-workspace";
import { getAPopulatedWorkspaceDocument } from "@/services/workspace/get-a-populated-workspace-document";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

// endpoint to get populated workspace document
export async function GET(request) {
  try {
    // Get user session
    const userSession = await getUserSession(cookies, true);


    // Get the populated workspace document
    const workspace = await getAPopulatedWorkspaceDocument(
      userSession.currentWorkspace._id,
      userSession._id
    );

    return NextResponse.json({ workspace }, { status: 200 });
  } catch (error) {
    console.error("Error in GET request:", error);

    // Handle specific error cases
    if (error.message === "Workspace not found or user is not a member") {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { message: error.message || "An error occurred" },
      { status: error.statusCode || 500 }
    );
  }
}

// endpoint to create workspace.
export async function POST(request) {
  try {
    // Get user session
    const userSession = await getUserSession(cookies, true);

    // Parse the request body
    const body = await request.json();
    const { name, username, profilePicture, filename } = body;

    // Validate input
    if (!name || !username) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check file if profilePicture is provided
    if (profilePicture) {
      // Check file type
      const fileType = profilePicture.split(";")[0].split(":")[1];
      if (!ALLOWED_FILE_TYPES.includes(fileType)) {
        return NextResponse.json(
          {
            message:
              "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.",
          },
          { status: 400 }
        );
      }

      // Check file size
      const buffer = Buffer.from(profilePicture.split(",")[1], "base64");
      if (buffer.length > MAX_FILE_SIZE) {
        return NextResponse.json(
          { message: "Profile picture must be less than 10MB" },
          { status: 400 }
        );
      }
    }

    // Create a workspace document and handle file upload
    const newWorkspace = await createAWorkspaceDocument(
      name,
      username,
      userSession._id,
      profilePicture,
      filename
    );

    // set new workspace as user current workspace
    await changeUserCurrentWorkspace(userSession._id, newWorkspace._id);

    return NextResponse.json(
      { message: "New workspace created", data: newWorkspace },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in POST request:", error);
    return NextResponse.json(
      { message: error.message || "An error occurred" },
      { status: error.statusCode || 500 }
    );
  }
}
