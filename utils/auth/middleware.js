// utils/dynamodb.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { cookies } from "next/headers";

const client = new DynamoDBClient({ region: "ap-south-1" });
const docClient = DynamoDBDocumentClient.from(client);

export async function getUser(sessionId) {
  const command = new GetCommand({
    TableName: "UserSessions",
    Key: { sessionId },
  });

  try {
    const response = await docClient.send(command);
    return response.Item;
  } catch (error) {
    console.error("Error fetching session:", error);
    return null;
  }
}

export async function deleteSession(sessionId) {
  const command = new DeleteCommand({
    TableName: "UserSessions",
    Key: { sessionId },
  });

  try {
    await docClient.send(command);
  } catch (error) {
    console.error("Error deleting session:", error);
  }
}

