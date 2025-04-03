import mongoose from 'mongoose';
  
// tournament listing meaning the product is listed for sponsorship purposes
const tournamentListingOwnershipSchema = {
    tierId: { // References SponsorshipTier id
        type: String, 
        // required: function() {
        //     return this.transferType === 'tournamentListing';
        // }     
    },
};

export default tournamentListingOwnershipSchema;
