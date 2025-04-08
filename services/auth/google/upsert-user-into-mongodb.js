import mongoose from 'mongoose';
import User from "@/models/user/index.model";
import WalletModel from "@/models/payments/wallet.model";

// Connect to the database **Outside of handler function*
import connectToDatabaseMongoDB from '@/lib/database';
await connectToDatabaseMongoDB("upsertUserIntoMongoDB");

/**
 * Creates or updates a user in MongoDB based on Google OAuth data
 */
export async function upsertUserIntoMongoDB({
    name,
    username,
    profilePicture,
    googleUserId,
    googleEmail,
    googleAccessToken,
    accessTokenExpiryDate,
    refreshToken,
    googlePhone
}) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // check if user exists
        const doesUserExist = await User.findOne({ "google.email": googleEmail }).session(session);

        if (doesUserExist) {
            // update existing user, preserving their username and members
            const updatedUser = await User.findOneAndUpdate(
                {
                    "google.email": googleEmail
                },
                {
                    $set: {
                        name: doesUserExist.name,
                        username: doesUserExist.username.replace(/\s/g, ''), // Add this line
                        profilePicture: doesUserExist.profilePicture,
                        mainEmail: doesUserExist.mainEmail,
                        google: {
                            userId: googleUserId,
                            name: name,
                            email: googleEmail,
                            profilePicture: profilePicture,
                            phone: googlePhone,
                            accessToken: googleAccessToken,
                            accessTokenExpiryDate: accessTokenExpiryDate,
                            refreshToken: refreshToken
                        }
                    },
                    $addToSet: { providers: "google" }
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
            // Sanitize username and check availability
            const sanitizedUsername = username.replace(/\s/g, '');
            const doesUsernameExist = await User.findOne({
                "username": sanitizedUsername
            }).session(session);

            // Pre generate user id
            const newUserId = new mongoose.Types.ObjectId();

            const userDocument = {
                _id: newUserId,
                type: 'individual',
                name: name,
                username: doesUsernameExist 
                    ? sanitizedUsername + Math.floor(Math.random() * 100)
                    : sanitizedUsername,
                profilePicture: profilePicture,
                providers: ["google"],
                mainEmail: googleEmail,
                domain: "your-site-demo.vercel.app",
                onboardingStatus: "discover",
                currentWorkspaceId: newUserId,
                creator: newUserId,
                members: [{
                    userId: newUserId,
                    role: 'admin'
                }],
                google: {
                    userId: googleUserId,
                    name: name,
                    email: googleEmail,
                    profilePicture: profilePicture,
                    phone: googlePhone,
                    accessToken: googleAccessToken,
                    accessTokenExpiryDate: accessTokenExpiryDate,
                    refreshToken: refreshToken
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
        console.error('Error in upsertUserIntoMongoDB:', error);
        throw new Error(`Failed to upsert user: ${error.message}`);
    } finally {
        session.endSession();
    }
}

