import crypto from 'crypto';
import CustomError from '@/api-lib/error-handling/custom-error';

// Constants
const AUTH_EXPIRATION_TIME = 86400; // 24 hours in seconds

export async function verifyTelegramAuthData(authData) {
    try {
        // Validate input
        if (!authData || typeof authData !== 'object') {
            throw new CustomError('Invalid authentication data', 400);
        }

        const { hash, ...data } = authData;

        // Ensure required fields are present
        if (!hash || !data.auth_date) {
            throw new CustomError('Missing required fields in authentication data', 400);
        }

        // Remove null values and create check string
        const checkString = Object.keys(data)
            .sort()
            .filter(key => data[key] !== null)
            .map(key => `${key}=${data[key]}`)
            .join('\n');

        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
            throw new CustomError('Bot token not configured', 500);
        }

        // Generate HMAC for verification
        const secretKey = crypto.createHash('sha256').update(botToken).digest();
        const hmac = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

        // Compare HMAC with provided hash
        if (hmac !== hash) {
            throw new CustomError('Invalid authentication data', 401);
        }

        // Check if authentication is expired
        const authDate = parseInt(data.auth_date);
        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime - authDate > AUTH_EXPIRATION_TIME) {
            throw new CustomError('Authentication expired', 401);
        }

        // Return verified data
        return data;
    } catch (error) {
        console.error('Verification error details:', error);
        throw error;
    }
}