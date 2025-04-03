import mongoose from 'mongoose';
import User from "@/models/user/index.model";
import WalletModel from "@/models/payments/wallet.model";

// Connect to the database **Outside of handler function*
import connectToDatabaseMongoDB from '@/lib/database';
await connectToDatabaseMongoDB("upsertTelegramUserIntoMongoDB");

/**
 * Creates or updates a user in MongoDB based on Telegram OAuth data
 */
export async function upsertTelegramUserIntoMongoDB({
    userId,
    firstName,
    lastName = '', // Default to empty string if missing
    username = null, // Default to null if missing
    profilePicture = null, // Default to null if missing
    authorizationDate
}) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Check if user exists
        const doesUserExist = await User.findOne({ "telegram.userId": userId }).session(session);

        if (doesUserExist) {
            // Update existing user, preserving their username and members
            const updatedUser = await User.findOneAndUpdate(
                { "telegram.userId": userId },
                {
                    $set: {
                        name: doesUserExist.name,
                        username: doesUserExist.username.replace(/\s/g, ''), // Sanitize username
                        profilePicture: profilePicture || doesUserExist.profilePicture, // Preserve existing if missing
                        telegram: {
                            userId: userId,
                            firstName: firstName,
                            lastName: lastName,
                            username: username || doesUserExist.telegram?.username, // Preserve existing if missing
                            profilePicture: profilePicture || doesUserExist.telegram?.profilePicture, // Preserve existing if missing
                            authorizationDate: authorizationDate
                        }
                    },
                    $addToSet: { providers: "telegram" }
                },
                { 
                    session,
                    upsert: false, 
                    new: true,
                    runValidators: true
                }
            );

            await session.commitTransaction();
            return updatedUser;
        } else {
            // Use Telegram username if available, otherwise fallback to firstName
            const baseUsername = username || firstName;
            const sanitizedUsername = baseUsername.replace(/\s/g, ''); // Remove spaces
            const doesUsernameExist = await User.findOne({
                "username": sanitizedUsername
            }).session(session);

            // Generate a unique username if the sanitized username already exists
            let finalUsername = sanitizedUsername;
            if (doesUsernameExist) {
                let uniqueUsernameFound = false;
                let attempt = 1;
                while (!uniqueUsernameFound && attempt <= 10) { // Prevent infinite loops
                    const tempUsername = `${sanitizedUsername}${Math.floor(Math.random() * 100)}`; // Append random number
                    const usernameExists = await User.findOne({ "username": tempUsername }).session(session);
                    if (!usernameExists) {
                        finalUsername = tempUsername;
                        uniqueUsernameFound = true;
                    }
                    attempt++;
                }
                if (!uniqueUsernameFound) {
                    throw new Error("Unable to generate a unique username after multiple attempts");
                }
            }

            // Pre-generate user id
            const newUserId = new mongoose.Types.ObjectId();

            const userDocument = {
                _id: newUserId,
                type: 'individual',
                name: `${firstName} ${lastName}`.trim(),
                username: finalUsername, // Use the final unique username
                profilePicture: profilePicture,
                providers: ["telegram"],
                mainEmail: null, // Telegram does not provide email
                onboardingStatus: "discover",
                currentWorkspaceId: newUserId,
                creator: newUserId,
                members: [{
                    userId: newUserId,
                    role: 'admin'
                }],
                telegram: {
                    userId: userId,
                    firstName: firstName,
                    lastName: lastName,
                    username: username,
                    profilePicture: profilePicture,
                    authorizationDate: authorizationDate
                }
            };

            // Create user and wallet in the same transaction
            const newUser = await User.create([userDocument], { session });
            
            // Create wallet explicitly instead of relying on middleware
            const wallet = new WalletModel({
                type: 'individual',
                userId: newUserId,
                balances: {
                    KES: { balance: 0 },
                    USD: { balance: 0 }
                }
            });
            
            await wallet.save({ session });

            await session.commitTransaction();
            return newUser[0]; // Create with session returns an array
        }
    } catch (error) {
        await session.abortTransaction();
        console.error('Error in upsertTelegramUserIntoMongoDB:', error);
        throw new Error(`Failed to upsert user: ${error.message}`);
    } finally {
        session.endSession();
    }
}