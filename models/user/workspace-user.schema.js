import mongoose from 'mongoose';
  
const workspaceUserSchema = {
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: {
        type: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            role: {
                type: String,
                enum: ['admin', 'editor', 'viewer'],
                default: 'viewer',
                required: true
            },
            isPubliclyVisibleInProfile: {
                type: Boolean,
                required: true,
                default:false
            }
        }],
        validate: [
            {
                // Ensure at least one member for both types
                validator: function(members) {
                    return members && members.length >= 1;
                },
                message: 'Must have at least one member'
            },
            {
                // For workspaces: creator must be admin
                // For individuals: the user themselves must be admin
                validator: function(members) {
                    if (this.type === 'workspace') {
                        return members.some(member => 
                            member.userId.toString() === this.creator.toString() && 
                            member.role === 'admin'
                        );
                    } else {
                        // For individual users, they must be admin of their own space
                        return members.some(member => 
                            member.userId.toString() === this._id.toString() && 
                            member.role === 'admin'
                        );
                    }
                },
                message: function(props) {
                    return this.type === 'workspace' 
                        ? 'Workspace creator must be a member with admin role'
                        : 'Individual user must be admin of their own space';
                }
            },
            {
                // Prevent duplicate members for both types
                validator: function(members) {
                    const userIds = members.map(m => m.userId.toString());
                    return userIds.length === new Set(userIds).size;
                },
                message: 'Duplicate members are not allowed'
            },
            {
                // For individual type: ensure first member is self with admin role
                validator: function(members) {
                    if (this.type === 'individual') {
                        return members[0]?.userId.toString() === this._id.toString() 
                            && members[0]?.role === 'admin';
                    }
                    return true;
                },
                message: 'Individual user must be the first member with admin role'
            }
        ]
    },
    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription'
    }
};

export default workspaceUserSchema;
