import mongoose from 'mongoose';
  
// initialOwnershipSchema
const initialOwnershipSchema = {
    addedBy: { // individial user who added product to platform
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: function() {
            return this.transferType === 'initial';
        }    
    },
};

export default initialOwnershipSchema;

