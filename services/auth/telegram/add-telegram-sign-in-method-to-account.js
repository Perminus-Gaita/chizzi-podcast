import mongoose from 'mongoose';
import User from "@/models/user/index.model";
import connectToDatabaseMongoDB from '@/lib/database';

// Connect to the database **Outside of handler function*
await connectToDatabaseMongoDB("addTelegramSignInToAccount");

/**
 * Adds Telegram sign-in method to an existing user account
 * @param {string} userId - The ID of the existing user
 * @param {object} telegramData - Telegram OAuth data
 * @param {string} telegramData.userId - Telegram user ID
 * @param {string} telegramData.firstName - Telegram user's first name
 * @param {string} telegramData.lastName - Telegram user's last name (optional)
 * @param {string} telegramData.username - Telegram username (optional)
 * @param {string} telegramData.profilePicture - Telegram profile picture URL (optional)
 * @param {Date} telegramData.authorizationDate - Date of authorization
 * @returns {object} - Updated user document
 */
export async function addTelegramSignInToAccount(userId, telegramData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Find the existing user by their ID
        const existingUser = await User.findById(userId).session(session);

        if (!existingUser) {
            throw new Error("User not found");
        }

        // Check if Telegram is already connected to this account
        if (existingUser.telegram?.userId) {
            throw new Error("Telegram account is already connected to this user");
        }

        // Create conditions array only with valid values for duplicate check
        const conditions = [];
        if (telegramData.userId != null) {
            conditions.push({ 'telegram.userId': telegramData.userId });
        }
        if (telegramData.username != null) {
            conditions.push({ 'telegram.username': telegramData.username });
        }

        // Only check for duplicates if we have conditions to check
        if (conditions.length > 0) {
            const duplicateUser = await User.findOne({
                $or: conditions
            }).session(session);

            if (duplicateUser) {
                throw new Error("This Telegram account is already connected to another user");
            }
        }

        // Update the user with Telegram data
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    telegram: {
                        userId: telegramData.userId,
                        firstName: telegramData.firstName,
                        lastName: telegramData.lastName || '', // Default to empty string if missing
                        username: telegramData.username || null, // Default to null if missing
                        profilePicture: telegramData.profilePicture || null, // Default to null if missing
                        authorizationDate: telegramData.authorizationDate
                    }
                },
                $addToSet: { providers: "telegram" } // Add Telegram to providers if not already present
            },
            {
                session,
                new: true, // Return the updated document
                runValidators: true // Ensure schema validations are applied
            }
        );

        await session.commitTransaction();
        return updatedUser;
    } catch (error) {
        await session.abortTransaction();
        console.error('Error in addTelegramSignInToAccount:', error);
        throw new Error(`Failed to add Telegram sign-in method: ${error.message}`);
    } finally {
        session.endSession();
    }
}