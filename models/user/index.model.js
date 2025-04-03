// models/user/user.model.js
import mongoose from 'mongoose';
import individualUserSchema from './individual-user.schema.js';
import workspaceUserSchema from './workspace-user.schema.js';
  
const SocialLinkSchema = new mongoose.Schema({
    platform: {
        type: String,
        required: true,
        trim: true,
        minlength: [1, "Platform name must be at least 1 character long"],
        maxlength: [30, "Platform name cannot be more than 30 characters long"],
        validate: {
            validator: function(v) {
                // Allows alphanumeric characters, spaces, and some special characters
                const platformNameRegex = /^[a-zA-Z0-9 \-_.]+$/;
                return platformNameRegex.test(v);
            },
            message: props => `${props.value} is not a valid platform name! Use alphanumeric characters, spaces, hyphens, underscores, or periods.`
        }
    },
    link: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                // Comprehensive URL validation
                const urlRegex = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
                return urlRegex.test(v);
            },
            message: props => `${props.value} is not a valid URL!`
        }
    }
}, { _id: false });;

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: [1, "Name must be at least 1 character long"],
        maxlength: [40, "Name cannot be more than 40 characters long"],
    },
    username: {
        type: String,
        required: true,
        minlength: [3, "Username must be at least 3 characters long"],
        maxlength: [40, "Username cannot be more than 40 characters long"],
        unique: [true, "Username not available. Try another one"],
    },
    profilePicture: {
        type: String
    },
    bannerImage: {
        type: String
    },
    socialLinks: {
        type: [SocialLinkSchema],
        validate: [
            {
                validator: function(v) {
                    return v.length <= 10; // Limit to 10 social links
                },
                message: 'Maximum of 10 social links allowed'
            }
        ]
    },
    type: {
        type: String,
        enum: ['individual', 'workspace'],
        required: true
    },
    ...individualUserSchema,
    ...workspaceUserSchema
},
{
    timestamps: true
});

const userModel = mongoose?.models?.User || mongoose.model("User", UserSchema);

export default userModel;