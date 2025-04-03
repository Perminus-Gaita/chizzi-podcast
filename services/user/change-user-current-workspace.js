import userModel from "@/models/user/index.model";

// Connect to the database **Outside of handler function**
import connectToDatabaseMongoDB from "@/lib/database";
await connectToDatabaseMongoDB("changeUserCurrentWorkspace");

export async function changeUserCurrentWorkspace(
  userId,
  newCurrentWorkspaceId
) {
  try {
    // Validate inputs
    if (!userId || !newCurrentWorkspaceId) {
      throw new Error("Both userId and newCurrentWorkspaceId are required");
    }

    // First, verify that the target workspace exists and is actually a workspace
    const targetWorkspace = await userModel.findById(newCurrentWorkspaceId);
    if (!targetWorkspace) {
      throw new Error("Target workspace not found or is not a workspace");
    }

    // Check if the user exists and is an individual user
    const user = await userModel.findOne({ _id: userId, type: "individual" });
    if (!user) {
      throw new Error("User not found or is not an individual user");
    }

    // Check if the user is a member of the workspace
    const isMember = targetWorkspace.members.some(
      (member) => member.userId.toString() === userId.toString()
    );
    if (!isMember) {
      throw new Error("User is not a member of the target workspace");
    }

    // Update the user's current workspace
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { currentWorkspaceId: newCurrentWorkspaceId },
      { new: true, runValidators: true }
    );

    // Verify the update was successful
    if (
      updatedUser.currentWorkspaceId.toString() !==
      newCurrentWorkspaceId.toString()
    ) {
      throw new Error("Failed to update current workspace");
    }

    const response = {
      ...updatedUser.toObject(),
      currentWorkspace: {
        username: targetWorkspace.username,
      },
    };

    // return updatedUser;
    return response;
  } catch (error) {
    console.error("Error changing user's current workspace:", error);
    throw error;
  }
}
