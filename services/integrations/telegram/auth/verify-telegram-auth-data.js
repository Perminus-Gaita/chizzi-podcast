import crypto from 'crypto';
import CustomError from '@/api-lib/error-handling/custom-error';

export async function verifyTelegramAuth(authData) {
    try {
        const { hash, ...data } = authData;
        
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

        // Log full process for debugging
        console.log('Data for verification:', JSON.stringify(data, null, 2));
        console.log('Check string (exact):', checkString);
        
        const secretKey = crypto
            .createHash('sha256')
            .update(botToken)
            .digest();

        const hmac = crypto
            .createHmac('sha256', secretKey)
            .update(checkString)
            .digest('hex');

        console.log('Full comparison:');
        console.log('Expected:', hash);
        console.log('Calculated:', hmac);
        console.log('Match?', hmac === hash);

        if (hmac !== hash) {
            throw new CustomError('Invalid authentication data', 401);
        }

        // Skip auth date check during development if needed
        const authDate = parseInt(data.auth_date);
        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime - authDate > 86400) {
            throw new CustomError('Authentication expired', 401);
        }

        return data;
    } catch (error) {
        console.error('Verification error details:', error);
        throw error;
    }
}