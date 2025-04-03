import mongoose from 'mongoose';
import User from "@/models/user/index.model";

// Connect to the database **Outside of handler function*
import connectToDatabaseMongoDB from '@/lib/database';
await connectToDatabaseMongoDB("addGoogleSignInToAccount");

/**
 * Adds Google sign-in method to an existing user account
 * @param {string} userId - The ID of the existing user
 * @param {object} googleData - Google OAuth data
 * @param {string} googleData.userId - Google user ID
 * @param {string} googleData.email - Google user's email
 * @param {string} googleData.profilePicture - Google profile picture URL (optional)
 * @param {string} googleData.phone - Google user's phone number (optional)
 * @param {string} googleData.accessToken - Google access token
 * @param {Date} googleData.accessTokenExpiryDate - Expiry date of the access token
 * @param {string} googleData.refreshToken - Google refresh token
 * @returns {object} - Updated user document
 */
export async function addGoogleSignInToAccount(userId, googleData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Find the existing user by their ID
        const existingUser = await User.findById(userId).session(session);

        if (!existingUser) {
            throw new Error("User not found");
        }

        // Check if Google is already connected to this account
        if (existingUser.google?.userId) {
            throw new Error("Google account is already connected to this user");
        }

        // Check if another user already has the same Google ID or email
        const duplicateUser = await User.findOne({
            $or: [
                { 'google.userId': googleData.userId },
                { 'google.email': googleData.email }
            ]
        }).session(session);

        if (duplicateUser) {
            throw new Error("This Google account is already connected to another user");
        }

        // Update the user with Google data
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    google: {
                        userId: googleData.userId,
                        email: googleData.email,
                        profilePicture: googleData.profilePicture || null, // Default to null if missing
                        phone: googleData.phone || null, // Default to null if missing
                        accessToken: googleData.accessToken,
                        accessTokenExpiryDate: googleData.accessTokenExpiryDate,
                        refreshToken: googleData.refreshToken
                    }
                },
                $addToSet: { providers: "google" } // Add Google to providers if not already present
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
        console.error('Error in addGoogleSignInToAccount:', error);
        throw new Error(`Failed to add Google sign-in method: ${error.message}`);
    } finally {
        session.endSession();
    }
}