import { NextResponse } from "next/server";
import { getUser } from "@/utils/auth/getUser";
import { cookies } from "next/headers";
import {
  IoTDataPlaneClient,
  PublishCommand,
} from "@aws-sdk/client-iot-data-plane";
import axios from "axios";
import notificationModel from "@/models/notification.model";

const AWSIoTEndpoint = `https://${
  process.env.NODE_ENV === "development"
    ? process.env.AWS_IOT_ENDPOINT_DEVELOPMENT
    : process.env.AWS_IOT_ENDPOINT_PRODUCTION
}`;

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

    const { payload } = await request.json();

    if (!payload || !payload.message) {
      return NextResponse.json(
        { message: "Invalid request. 'message' is required." },
        { status: 400 }
      );
    }

    console.log("### THE MESSAGE ###");
    console.log(payload);

    // Publish the message to the IoT topic
    const publishResult = await iotPublish(userId, payload);

    console.log("### THE RESULT ###");
    console.log(publishResult);

    // Return success response
    return NextResponse.json(
      // { message: "Message published successfully", publishResult },
      { message: "", timestamp: new Date().toISOString() },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending notification:", error);

    // Enhanced error handling
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to send notification";
    const statusCode = error.response?.status || 500;

    return NextResponse.json({ message: errorMessage }, { status: statusCode });
  }
}
