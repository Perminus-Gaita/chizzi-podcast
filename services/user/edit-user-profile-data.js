import userModel from "@/models/user/index.model";
import mongoose from 'mongoose';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import connectToDatabaseMongoDB from "@/lib/database";

// Initialize S3 client
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Connect to the database
await connectToDatabaseMongoDB("editUserProfileData");

// Constants
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB in bytes

async function uploadToS3(file, userId, type) {
    if (!file) return null;

    try {
        // Convert base64 to buffer if the file is base64
        let buffer;
        if (typeof file === 'string' && file.startsWith('data:')) {
            const base64Data = file.split(',')[1];
            buffer = Buffer.from(base64Data, 'base64');
        } else {
            buffer = file;
        }

        // Check file size
        if (buffer.length > MAX_FILE_SIZE) {
            throw new Error(`${type} image exceeds maximum size of 15MB`);
        }

        // Generate key based on type
        const key = `${userId}/${type}`;

        // Upload to S3
        const command = new PutObjectCommand({
            Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: 'image/jpeg', // Adjust based on your needs
            ACL: 'public-read',
            Metadata: {
                userId: userId.toString(),
                imageType: type
            }
        });

        await s3Client.send(command);

        // Return the S3 URL
        return `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    } catch (error) {
        console.error('Error uploading to S3:', error);
        if (error.message.includes('maximum size')) {
            throw error; // Re-throw size limit errors
        }
        throw new Error('Failed to upload image');
    }
}

export async function editUserProfileData(userIdOrUsername, sessionUserId, updateData) {
    try {
        // Validate inputs
        if (!userIdOrUsername) {
            throw new Error("userId or username is required");
        }
        if (!sessionUserId) {
            throw new Error("sessionUserId is required");
        }
        if (!updateData || Object.keys(updateData).length === 0) {
            throw new Error("Update data is required");
        }

        // Create match stage based on whether input is ID or username
        const isValidObjectId = mongoose.Types.ObjectId.isValid(userIdOrUsername);
        const matchStage = isValidObjectId
            ? { _id: new mongoose.Types.ObjectId(userIdOrUsername) }
            : { username: userIdOrUsername };

        // First, fetch the user to check permissions
        const user = await userModel.findOne(matchStage);
        if (!user) {
            throw new Error('User not found');
        }

        // Handle image uploads if present
        const sanitizedUpdate = { ...updateData };
        
        if (updateData.profilePicture) {
            const profilePictureUrl = await uploadToS3(
                updateData.profilePicture,
                user._id,
                'avatar'
            );
            sanitizedUpdate.profilePicture = profilePictureUrl;
        }

        if (updateData.bannerImage) {
            const bannerImageUrl = await uploadToS3(
                updateData.bannerImage,
                user._id,
                'bannerImage'
            );
            sanitizedUpdate.bannerImage = bannerImageUrl;
        }

        // Rest of the validation and update logic remains the same...
        const allowedFields = ['name', 'username', 'profilePicture', "bannerImage", 'socialLinks'];
        
        Object.keys(sanitizedUpdate).forEach(key => {
            if (!allowedFields.includes(key)) {
                delete sanitizedUpdate[key];
            }
        });

        // Validate social links if present
        if (sanitizedUpdate.socialLinks) {
            if (!Array.isArray(sanitizedUpdate.socialLinks)) {
                throw new Error('socialLinks must be an array');
            }
            if (sanitizedUpdate.socialLinks.length > 10) {
                throw new Error('Maximum of 10 social links allowed');
            }
            
            sanitizedUpdate.socialLinks.forEach(link => {
                if (!link.platform || !link.link) {
                    throw new Error('Each social link must have platform and link');
                }
                
                const platformNameRegex = /^[a-zA-Z0-9 \-_.]+$/;
                if (!platformNameRegex.test(link.platform)) {
                    throw new Error(`Invalid platform name: ${link.platform}`);
                }
                
                const urlRegex = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
                if (!urlRegex.test(link.link)) {
                    throw new Error(`Invalid URL for platform ${link.platform}`);
                }
            });
        }

        // Check username uniqueness if updating
        if (sanitizedUpdate.username) {
            const existingUser = await userModel.findOne({ 
                username: sanitizedUpdate.username,
                _id: { $ne: user._id }
            });
            if (existingUser) {
                throw new Error('Username already taken');
            }
        }

        // Perform the update
        const updatedUser = await userModel.findOneAndUpdate(
            matchStage,
            { $set: sanitizedUpdate },
            { 
                new: true,
                runValidators: true,
                select: {
                    _id: 1,
                    name: 1,
                    username: 1,
                    profilePicture: 1,
                    bannerImage: 1,
                    type: 1,
                    socialLinks: 1,
                    createdAt: 1
                }
            }
        );

        if (!updatedUser) {
            throw new Error('Failed to update user');
        }

        // Add computed fields
        const result = {
            ...updatedUser.toObject(),
            isSessionUser: true,
            isSessionUserAMemberInThisWorkspace: user.type === 'workspace' ? 
                user.members.some(member => member.userId.toString() === sessionUserId) : 
                false,
            sessionUserRoleInWorkspace: user.type === 'workspace' ?
                user.members.find(member => member.userId.toString() === sessionUserId)?.role :
                null
        };

        return result;
    } catch (error) {
        console.error("Error updating user's profile data:", error);
        throw error;
    }
}