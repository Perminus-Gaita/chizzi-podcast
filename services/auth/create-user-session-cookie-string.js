import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import crypto from 'crypto';

// Connect to DynamoDB
const client = new DynamoDBClient({
    region: "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Constants for session duration
const SESSION_DURATION = {
    SECONDS: 7 * 24 * 3600,  // 7 days in seconds
    MILLISECONDS: 7 * 24 * 3600 * 1000  // 7 days in milliseconds
};

/**
 * Extracts the domain from a hostname or URL
 * @param {string} hostname - The hostname or URL to extract the domain from
 * @returns {string} - The extracted domain
 */
function extractDomain(hostname) {
    // If the hostname includes a protocol (http://, https://, etc.), remove it
    let domain = hostname.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '');
    
    // Remove any path, query parameters, or hash fragments
    domain = domain.split('/')[0];
    
    // Remove port if present
    domain = domain.split(':')[0];
    
    return domain;
}

/**
 * Creates a session in DynamoDB and returns cookie string
 */
export async function createUserSessionCookieString(userId) {
    try {
        const sessionData = await createUserSessionInDynamoDB(userId);
        
        const isProduction = process.env.ENVIRONMENT === 'production';
        const isDevelopment = process.env.ENVIRONMENT === 'development';
        
        // Get expiration date for absolute expiration
        const expirationDate = new Date(Date.now() + SESSION_DURATION.MILLISECONDS);
        
        // Base cookie options
        const cookieOptions = {
            sessionId: sessionData.sessionId,
            HttpOnly: true,
            Path: '/',
            // Use both Max-Age and Expires for better browser compatibility
            'Max-Age': SESSION_DURATION.SECONDS,
            Expires: expirationDate.toUTCString(),
            // Ensure cookies persist when app is added to home screen
            'Partitioned': false
        };

        // Production-specific settings
        if (isProduction) {
            cookieOptions.Secure = true;
            cookieOptions.SameSite = 'None';
            
            // Use hostname from environment variable and extract domain automatically
            const hostname = process.env.MYHOSTNAME;
            cookieOptions.Domain = extractDomain(hostname);
        } 
        // Development-specific settings
        else if (isDevelopment) {
            cookieOptions.Secure = false;
            cookieOptions.SameSite = 'Lax';
            
            // For development, you might want to set a domain too
            if (process.env.MYHOSTNAME) {
                cookieOptions.Domain = extractDomain(process.env.MYHOSTNAME);
            }
        }
        // Any other environment (staging, etc.)
        else {
            cookieOptions.Secure = true;
            cookieOptions.SameSite = 'Lax';
            
            // For other environments, extract domain if hostname is provided
            if (process.env.MYHOSTNAME) {
                cookieOptions.Domain = extractDomain(process.env.MYHOSTNAME);
            }
        }

        // Create cookie string with proper formatting
        const cookieString = `sessionId=${sessionData.sessionId}; ${Object.entries(cookieOptions)
            .filter(([key]) => key !== 'sessionId') // Skip sessionId as it's already added
            .map(([key, value]) => {
                if (typeof value === 'boolean') {
                    return value ? key : '';
                }
                // Handle special case for Expires to ensure proper date format
                if (key === 'Expires') {
                    return `${key}=${value}`;
                }
                return `${key}=${value}`;
            })
            .filter(Boolean)
            .join('; ')}`;

        return cookieString;

    } catch (error) {
        console.error('Error creating user session cookie:', error);
        throw error;
    }
}

/**
 * Creates a user session in DynamoDB with extended expiration
 */
async function createUserSessionInDynamoDB(mongodbUserId) {
    try {
        const sessionId = crypto.randomBytes(32).toString('hex'); // Increased from 16 to 32 bytes for extra security
        const expirationTime = Math.floor(Date.now() / 1000) + SESSION_DURATION.SECONDS;

        // Adding additional session metadata
        const command = new PutItemCommand({
            TableName: 'UserSessions',
            Item: {
                sessionId: { S: sessionId },
                userId: { S: mongodbUserId.toString() },
                expirationTime: { N: expirationTime.toString() },
                createdAt: { N: Math.floor(Date.now() / 1000).toString() },
                lastAccessed: { N: Math.floor(Date.now() / 1000).toString() },
                userAgent: { S: 'web' }, // You can pass actual user agent if needed
            },
            // Enable TTL on the expirationTime field
            TimeToLive: {
                Enabled: true,
                AttributeName: 'expirationTime'
            }
        });

        const response = await client.send(command);
        return {
            sessionCreationResponse: response,
            sessionId: sessionId
        };
    } catch (error) {
        console.error('Error creating DynamoDB session:', error);
        throw error;
    }
}