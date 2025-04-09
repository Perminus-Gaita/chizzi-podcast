import mongoose from "mongoose";
import { getUser } from "@/utils/auth/getUser";
import { cookies } from "next/headers";
import {
  IoTDataPlaneClient,
  PublishCommand,
} from "@aws-sdk/client-iot-data-plane";
import { NextResponse } from "next/server";
import ChatModel from "@/models/chat.model";

const AWSIoTEndpoint = `https://${
  process.env.NODE_ENV === "development"
    ? process.env.AWS_IOT_ENDPOINT_DEVELOPMENT
    : process.env.AWS_IOT_ENDPOINT_PRODUCTION
}`;

// const ioTClient = new IoTDataPlaneClient({ endpoint: AWSIoTEndpoint });

const ioTClient = new IoTDataPlaneClient({
  endpoint: AWSIoTEndpoint,
  maxAttempts: 3, // Add retry logic
});

const iotPublish = async (topic, payload) => {
  try {
    const params = {
      topic: topic,
      qos: 1,
      payload: Buffer.from(JSON.stringify(payload)),
    };

    const command = new PublishCommand(params);
    const result = await ioTClient.send(command);
    return result;
  } catch (err) {
    console.error("iotPublish error:", err);
    throw err;
  }
};

export async function POST(request) {
  try {
    const sessionUser = await getUser(cookies);

    if (!sessionUser) {
      return NextResponse.json(
        { message: "No User Session Available" },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const userId = sessionUser?._id;

    // Parse the JSON body from the incoming request
    const { payload } = await request.json();

    if (!payload || !payload.message) {
      return NextResponse.json(
        { message: "Invalid request. 'message' is required." },
        { status: 400 }
      );
    }

    // Save the chat message to MongoDB
    const newMessage = new ChatModel({
      message: payload.message,
      sender: new mongoose.Types.ObjectId(userId),
      createdAt: new Date().toISOString(),
    });

    await newMessage.save();

    console.log("### THE MESSAGE ###");
    console.log(payload);

    // Publish the message to the IoT topic
    const publishResult = await iotPublish("arenachat", payload);

    console.log("### THE RESULT ###");
    console.log(publishResult);

    // Return success response
    return NextResponse.json(
      // { message: "Message published successfully", publishResult },
      { message: "", timestamp: new Date().toISOString() },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error publishing message to IoT:", error);

    // Return error response
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
