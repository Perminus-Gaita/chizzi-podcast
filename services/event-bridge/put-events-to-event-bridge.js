import { EventBridgeClient, PutEventsCommand } from "@aws-sdk/client-eventbridge";
import AWSXRay from "aws-xray-sdk-core";

// For observability
const eventBridgeClient = AWSXRay.captureAWSv3Client(
    new EventBridgeClient({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    })
);

export async function putEventsToEventBridge(events) {
    console.log(events);
    const eventPayload = stringifyDetail(events);

    const command = new PutEventsCommand(eventPayload);
    const response = await eventBridgeClient.send(command);

    return response;
};

// The detail value has to be a json string
function stringifyDetail(inputJson) {
    try {
        // Check if the "Entries" field is an array
        if (Array.isArray(inputJson.Entries)) {
            // Create an array to store processed entries
            const processedEntries = [];
    
            // Iterate through the entries
            for (const entry of inputJson.Entries) {
                // Stringify the "Detail" field and create a new processed entry
                const processedEntry = {
                    Detail: JSON.stringify(entry.Detail),
                    DetailType: entry.DetailType,
                    EventBusName: entry.EventBusName,
                    Source: entry.Source
                };
        
                // Push the processed entry to the array
                processedEntries.push(processedEntry);
            }
    
            // Return the modified input JSON with processed entries
            return { Entries: processedEntries };
        } else {
            throw new Error('Input JSON must have an "Entries" array.');
        }
    } catch (error) {
        throw error;
    }
}