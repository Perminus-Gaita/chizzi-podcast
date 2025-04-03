import { SFNClient, StartSyncExecutionCommand } from "@aws-sdk/client-sfn";

// Initialize the SFN client
const client = new SFNClient({
  region: process.env.AWS_REGION, // Make sure to set this in your .env file
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function startSyncExecution(
  stateMachineName,
  input,
  name
){
  try {
    const awsRegion =  process.env.AWS_REGION;
    const awsAccountNumber =  process.env.AWS_ACCOUNT_NUMBER;
    const commandInput = {
      stateMachineArn: `arn:aws:states:${awsRegion}:${awsAccountNumber}:stateMachine:${stateMachineName}`,
      input: JSON.stringify(input),
      name
    };

    const command = new StartSyncExecutionCommand(commandInput);
    const response = await client.send(command);

    if (response.status === "SUCCEEDED") {
      return {
        success: true,
        data: {
          status: response.status,
          executionArn: response.executionArn,
          output: response.output ? JSON.parse(response.output) : null,
          startDate: response.startDate,
          stopDate: response.stopDate,
        },
      };
    } else {
        console.error("Error while executing step function:", response);
      return {
        success: false,
        error: {
          message: response.error || "Execution failed",
          status: response.status || "UNKNOWN_ERROR",
          cause: parseIfJsonString(response?.cause)
        },
      };
    }
  } catch (error) {
    console.error("Error starting Step Function execution:", error);
    return {
      success: false,
      error: {
        message: error.message || "An unexpected error occurred",
        code: error.code || "UNEXPECTED_ERROR",
      },
    };
  }
}


function parseIfJsonString(cause) {
    try {
      // Attempt to parse the cause as JSON
      return JSON.parse(cause);
    } catch (error) {
      // If parsing fails, return the original string
      return cause;
    }
}

