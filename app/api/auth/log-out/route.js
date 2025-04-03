import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { cookies } from "next/headers";

// DynamoDB client setup
const client = new DynamoDBClient({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const docClient = DynamoDBDocumentClient.from(client);

export async function DELETE(request) {
  try {
    // Get the session ID from the cookie
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("sessionId")?.value;

    if (sessionId) {
      // Delete the session from DynamoDB
      const deleteCommand = new DeleteCommand({
        TableName: "UserSessions",
        Key: { sessionId },
      });
      await docClient.send(deleteCommand);

      // Clear the session cookie
      cookieStore.delete("sessionId");
    }

    // You might want to perform additional cleanup here, such as:
    // - Updating the user's last logout time in your MongoDB
    // - Invalidating any refresh tokens
    // - Logging the logout event

    return new Response(
      JSON.stringify({ message: "Logged out successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return new Response(JSON.stringify({ message: "Error during logout" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
