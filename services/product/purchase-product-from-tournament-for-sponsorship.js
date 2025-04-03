// @/services/product/purchase-product-from-tournament-for-sponsorship.js
import mongoose from "mongoose";
import productModel from "@/models/product/index.model";
import ProductOwnershipHistory from "@/models/product/ownership-history/index.model";
import CustomError from "@/api-lib/error-handling/custom-error";

/**
 * Purchases a product from a tournament for sponsorship
 * @param {Object} purchaseData - Purchase details
 * @param {Object} sessionUser - User session object
 * @returns {Promise<Object>} Updated product with ownership history
 */
export async function purchaseProductFromTournamentForSponsorship(purchaseData, sessionUser) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { productId, tournamentId, sponsorshipId, price } = purchaseData;
    const userId = sessionUser._id;

    // Find the product and populate the current owner details
    const product = await productModel
      .findById(productId)
      .populate('currentOwner')
      .session(session);

    if (!product) {
      throw new CustomError("Product not found", 404);
    }

    // Ensure the product is currently owned by the tournament using the populated data
    if (!product.currentOwner || product.currentOwner.currentOwnerId.toString() !== tournamentId || 
        product.currentOwner.currentOwnerModel !== 'Tournament') {
      throw new CustomError("Product is not owned by the tournament", 400);
    }

    // End the tournament ownership
    product.currentOwner.endDate = new Date();
    await product.currentOwner.save({ session });

    // Create new ownership history for sponsorship purchase
    const sponsorOwnership = new ProductOwnershipHistory({
      productId: product._id,
      currentOwnerId: userId,
      currentOwnerModel: "User",
      previousOwnerId: tournamentId,
      previousOwnerModel: "Tournament",
      previousOwnershipRecord: product.currentOwner._id,
      transferType: "sponsorPurchase",
      sponsorshipId,
      price: {
        amount: price.amount,
        currency: price.currency,
      },
      isRedeemed: false,
      startDate: new Date(),
      endDate: null,
    });

    // Save the new ownership record
    await sponsorOwnership.save({ session });

    // Update product's current owner
    product.currentOwner = sponsorOwnership._id;
    await product.save({ session });

    // Commit the transaction
    await session.commitTransaction();

    // Return the product with populated ownership history
    const updatedProduct = await productModel
      .findById(productId)
      .populate({
        path: 'currentOwner',
        populate: {
          path: 'previousOwnershipRecord'
        }
      });

    return {
      product: updatedProduct.toObject(),
      // No need for separate ownership history query, using populated data instead
      ownershipHistory: [
        updatedProduct.currentOwner.previousOwnershipRecord.toObject(),
        updatedProduct.currentOwner.toObject()
      ],
    };
  } catch (error) {
    await session.abortTransaction();
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError(error.message || "Error purchasing product for sponsorship", error.statusCode || 500);
  } finally {
    session.endSession();
  }
}