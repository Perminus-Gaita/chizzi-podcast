import mongoose from 'mongoose';
import initialOwnershipSchema from './initial-ownership.schema';
import tournamentListingOwnershipSchema from './tournament-listing-ownership.schema';
import sponsorPurchaseOwnershipSchema from './sponsor-purchase-ownership.schema';

const ProductOwnershipHistorySchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        index: true
    },
    currentOwnerId: { // Use refPath to allow the current owner to be a User or Tournament
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true,
        refPath: 'currentOwnerModel'
    },
    currentOwnerModel: { // This field determines which model currentOwnerId refers to
        type: String,
        required: true,
        enum: ['User', 'Tournament']
    },
    previousOwnerId: {
        type: mongoose.Schema.Types.ObjectId,
        index: true,
        refPath: 'previousOwnerModel',
        required: function() {
            return this.transferType !== 'initial';
        }    
    },
    previousOwnerModel: { // This field determines which model currentOwnerId refers to
        type: String,
        enum: ['User', 'Tournament'],
        required: function() {
            return this.transferType !== 'initial';
        }
    },
    previousOwnershipRecord: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductOwnershipHistory',
        required: function() {
          return this.transferType !== 'initial';
        }
    },
    startDate: { // ownership started on
        type: Date,
        default: Date.now,
        required: true
    },
    endDate: { // ownership ended on
        type: Date,
        default: null
    },
    transferType: { // how did this product come to the possesion of current owner?
        type: String,
        enum: [
            'initial', // First owner
            'tournamentListing',// - Product is listed for sponsorship
            'sponsorPurchase',// - Sponsor buys the product ✅
            'sponsorToTournamentPrizePool',// - Sponsor contributes purchased product to tournament prize pool ✅
            'tournamentWin',
        ],
        required: true
    },
    price: {
        amount: { 
            type: Number, 
            min: 0,
            required: true
        },
        currency: { 
            type: String, 
            enum: ['USD', 'KES'], // Only USD and Kenyan Shilling allowed
            required: true
        }
    },
    ...initialOwnershipSchema,
    ...tournamentListingOwnershipSchema,
    ...sponsorPurchaseOwnershipSchema,
}, { timestamps: true });

ProductOwnershipHistorySchema.index({ productId: 1, endDate: 1 });

const ProductOwnershipHistory = 
    mongoose.models.ProductOwnershipHistory || mongoose.model("ProductOwnershipHistory", ProductOwnershipHistorySchema);

export default ProductOwnershipHistory;
