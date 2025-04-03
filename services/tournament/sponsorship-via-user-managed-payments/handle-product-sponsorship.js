import mongoose from "mongoose";
import ProductPurchaseModel from "@/models/product-purchase.model";
import SponsorshipModel from "@/models/payments/sponsorship.model";
import productModel from "@/models/old-product.model";
import { TournamentModel } from "@/models/tournament.model";
import CustomError from "@/api-lib/error-handling/custom-error";

export async function handleProductSponsorship(
  sessionUser,
  tournamentId,
  productId,
  currency,
  transactionCode
) {
  // create mongodb database transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    //
    const { tournament: tournamentData, product: productData } =
      await getDetailsForPurchase(tournamentId, productId, session);

    if (productData.inventory <= productData.sold) {
      throw new CustomError("Product is sold out", 400);
    }

    if (productData.price.currency !== currency) {
      throw new CustomError("Currency mismatch", 400);
    }

    const totalAmount = productData.price.amount;
    if (totalAmount <= 0) {
      throw new CustomError("Invalid product amount", 400);
    }

    // Create purchase doc set status to processing
    const purchaseDocument = await createPurchaseDocument(
      sessionUser._id,
      productId,
      tournamentId,
      totalAmount,
      currency,
      session
    );

    // Update product inventory
    const updatedProduct = await updateProductInventory(
      productId,
      sessionUser._id,
      session
    );

    // Create sponsorship doc set status to processing
    const sponsorshipDoc = await createSponsorshipDocument(
      sessionUser._id,
      tournamentId,
      productId,
      totalAmount,
      currency,
      purchaseDocument._id,
      transactionCode,
      session
    );

    // update tournament document
    const updatedTournamentDoc = await updateTournamentDocument(
      tournamentId,
      sponsorshipDoc._id,
      sessionUser._id,
      totalAmount,
      currency,
      session
    );

    await session.commitTransaction();

    return {
      purchaseDocument,
      updatedProduct,
      sponsorship: sponsorshipDoc,
      tournament: updatedTournamentDoc,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

// get details about the purchase that will help in creating/updating other documents
const getDetailsForPurchase = async (tournamentId, productId, session) => {
  try {
    const tournament = await TournamentModel.findById(tournamentId).session(
      session
    );
    const product = await productModel.findById(productId).session(session);

    if (!tournament || !product) {
      throw new Error(
        tournament ? "Product not found" : "Tournament not found"
      );
    }

    return {
      tournament: {
        _id: tournament._id,
        creatorId: tournament.creator,
        targetAmount: tournament.sponsorshipDetails?.targetAmount || 0,
        currentAmount: tournament.sponsorshipDetails?.currentAmount || 0,
        telegramGroupId: tournament.telegramGroupId,
      },
      product: {
        price: {
          currency: product.price.currency,
          amount: product.price.amount,
        },
        inventory: product.inventory,
        sold: product.sold,
        creator: product.creator,
        tierId: product.tierId,
      },
    };
  } catch (error) {
    console.error("Error fetching details:", error);
    throw error;
  }
};

async function createPurchaseDocument(
  buyerId,
  productId,
  tournamentId,
  totalAmount,
  currency,
  mongodbTransactionSession
) {
  try {
    const creatorAmount = Math.floor(totalAmount * 0.7);
    const tournamentAmount = Math.floor(totalAmount * 0.25);
    const platformFee = totalAmount - creatorAmount - tournamentAmount;

    const newPurchaseDocument = new ProductPurchaseModel({
      buyerId: buyerId, // sessionUser._id,
      productId: productId,
      tournamentId: tournamentId,
      status: "processing",
      amount: totalAmount,
      creatorAmount,
      tournamentAmount,
      platformFee,
      currency,
      paymentMethod: "userManagedMpesa",
    });
    const purchaseDocument = await newPurchaseDocument.save({
      mongodbTransactionSession,
    });

    return purchaseDocument;
  } catch (error) {
    throw new Error(`Error creating purchase document: ${error.message}`);
  }
}

async function updateProductInventory(productId, buyerId, session) {
  try {
    //tournamentId, productId, currency, transactionCode
    const updatedProduct = await productModel.findByIdAndUpdate(
      productId,
      {
        $inc: {
          sold: 1,
          transferCount: 1,
        },
        $set: { currentOwner: buyerId },
        $push: {
          ownershipHistory: {
            owner: buyerId,
            acquiredAt: new Date(),
            transactionType: "sponsored",
          },
        },
      },
      {
        new: true,
        session,
        runValidators: true,
      }
    );

    if (!updatedProduct) {
      throw new Error("Product not found");
    }

    return updatedProduct;
  } catch (error) {
    throw new Error(`Error updating product inventory: ${error.message}`);
  }
}

async function createSponsorshipDocument(
  sponsorId,
  tournamentId,
  productId,
  amount, // tournamentAmount
  currency,
  purchaseId,
  mpesaTransactionCode,
  session
) {
  try {
    const newSponsorshipDocument = new SponsorshipModel({
      sponsorId: sponsorId,
      tournamentId: tournamentId,
      productId: productId,
      status: "processing",
      amount: amount,
      currency,
      paymentMethod: "userManagedMpesa",
      purchaseId: purchaseId,
      mpesaTransactionCode: mpesaTransactionCode,
    });

    const sponsorshipDoc = await newSponsorshipDocument.save({ session });

    return sponsorshipDoc;
  } catch (error) {
    throw new Error(`Error creating sponsorship doc: ${error.message}`);
  }
}

async function updateTournamentDocument(
  tournamentId,
  sponsorshipId,
  sponsorId,
  amount,
  currency,
  session
) {
  try {
    const updatedTournament = await TournamentModel.findByIdAndUpdate(
      tournamentId,
      {
        //   $inc: {
        //     "sponsorshipDetails.currentAmount": Number(update.amount)
        //   },
        $push: {
          "sponsorshipDetails.sponsors": {
            sponsorshipId: sponsorshipId,
            user: sponsorId,
            amount: Number(amount),
            currency: currency,
            sponsoredAt: new Date(),
          },
        },
      },
      {
        new: true,
        runValidators: true,
        session,
      }
    );

    if (!updatedTournament) {
      throw new Error("Tournament document not found");
    }

    return updatedTournament;
  } catch (error) {
    throw new Error(`Error updating tournament: ${error.message}`);
  }
}
