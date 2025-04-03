import mongoose from "mongoose";
import axios from "axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import ProductPurchaseModel from "@/models/product-purchase.model";
import SponsorshipModel from "@/models/payments/sponsorship.model";
import { TournamentModel } from "@/models/tournament.model";
import productModel from "@/models/product/index.model";
import ProductOwnershipHistory from "@/models/product/ownership-history/index.model";
import { getUserSession } from "@/services/auth/get-user-session";

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

    // Find the current tournament listing ownership record for this product
    const currentOwnershipRecord = await ProductOwnershipHistory.findOne({
      productId: productId,
      currentOwnerId: tournamentId,
      currentOwnerModel: 'Tournament',
      transferType: 'tournamentListing',
      endDate: null // Active ownership records only
    }).session(session);

    if (!currentOwnershipRecord) {
      throw new Error("Product not listed for this tournament");
    }

    // Count how many products the tournament owns and can sell
    const availableInventory = await ProductOwnershipHistory.countDocuments({
      productId: productId,
      currentOwnerId: tournamentId,
      currentOwnerModel: 'Tournament',
      transferType: 'tournamentListing',
      endDate: null // Only count active ownership records
    }).session(session);
    
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
          currency: currentOwnershipRecord.price.currency,
          amount: currentOwnershipRecord.price.amount,
        },
        inventory: availableInventory,
        sold: 0, // This is not needed since we're using availableInventory
        creator: product.initialOwner, // Using initialOwner instead of creator
        tierId: currentOwnershipRecord.tierId, // From the ownership record
        ownershipRecordId: currentOwnershipRecord._id // Pass the current ownership record ID
      },
    };
  } catch (error) {
    console.error("Error fetching details:", error);
    throw error;
  }
};

async function initializeTransaction(paystackTransactionData) {
  const url = "https://api.paystack.co/transaction/initialize";
  const YOUR_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

  const data = {
    email: paystackTransactionData.email,
    amount: paystackTransactionData.amount,
    currency: paystackTransactionData.currency,
    reference: paystackTransactionData.reference,
    callback_url: paystackTransactionData.callbackUrl,
    channels: paystackTransactionData.channels,
    metadata: paystackTransactionData.metadata,
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${YOUR_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    return {
      authorizationUrl: response.data.data.authorization_url,
      accessCode: response.data.data.access_code,
      reference: response.data.data.reference,
    };
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}

export async function POST(request) {
  const sessionUser = await getUserSession(cookies, true);

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { tournamentId, productId, currency, callbackUrl } =
      await request.json();

    if (!tournamentId || !productId || !currency || !callbackUrl) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const { tournament: tournamentData, product: productData } =
      await getDetailsForPurchase(tournamentId, productId, session);

    if (productData.inventory <= 0) {
      return NextResponse.json(
        { message: "Product is sold out" },
        { status: 400 }
      );
    }

    if (productData.price.currency !== currency) {
      return NextResponse.json(
        { message: "Currency mismatch" },
        { status: 400 }
      );
    }

    const totalAmount = productData.price.amount;
    if (totalAmount <= 0) {
      return NextResponse.json(
        { message: "Invalid product amount" },
        { status: 400 }
      );
    }

    const creatorAmount = Math.floor(totalAmount * 0.7);
    const tournamentAmount = Math.floor(totalAmount * 0.25);
    const platformFee = totalAmount - creatorAmount - tournamentAmount;

    const newTotalAmount = tournamentData.currentAmount + tournamentAmount;
    const willReachTarget = newTotalAmount >= tournamentData.targetAmount;

    const purchaseDocument = new ProductPurchaseModel({
      buyerId: sessionUser._id,
      productId: productId,
      tournamentId: tournamentId,
      status: "initiated",
      amount: totalAmount,
      creatorAmount,
      tournamentAmount,
      platformFee,
      currency,
      paymentMethod: "pending",
    });

    const sponsorshipDocument = new SponsorshipModel({
      sponsorId: sessionUser._id,
      tournamentId: tournamentId,
      productId: productId,
      status: "initiated",
      amount: tournamentAmount,
      type: "product",
      currency,
      paymentMethod: "pending",
      purchaseId: purchaseDocument._id,
    });

    const savedPurchase = await purchaseDocument.save({ session });
    const savedSponsorship = await sponsorshipDocument.save({ session });

    // Don't create the ownership record here - it will be created by the webhook upon successful payment

    const paystackTransactionData = {
      email:
        sessionUser?.mainEmail ||
        sessionUser?.google?.email ||
        `${sessionUser.username}@username.wufwuf.io`,
      amount: totalAmount,
      currency,
      reference: savedPurchase._id,
      callbackUrl,
      channels: ["card", "mobile_money"],
      metadata: {
        sponsor: {
          _id: sessionUser?._id,
          name: sessionUser?.name,
          username: sessionUser?.username,
          type: sessionUser?.type,
          profilePicture: sessionUser?.profilePicture,
          currentWorkspace: sessionUser?.currentWorkspace,
        },
        tournament: {
          _id: tournamentId,
          creator: tournamentData.creatorId,
          telegramGroupId: tournamentData.telegramGroupId,
          targetAmount: tournamentData.targetAmount,
          currentAmount: tournamentData.currentAmount,
        },
        product: {
          _id: productId,
          currentOwnershipRecordId: productData.ownershipRecordId, // Pass the current ownership record ID to the webhook
        },
        // used by evenbridge dont put it in an object
        paymentType: "product_purchase",
        paymentDetails: {
          sponsorshipId: savedSponsorship._id,
          purchaseId: savedPurchase._id,
          creatorAmount,
          tournamentAmount,
          platformFee,
        },
        creatorId: productData.creator,
        startTournament: willReachTarget,
      },
    };

    const { authorizationUrl } = await initializeTransaction(
      paystackTransactionData
    );

    await session.commitTransaction();

    return NextResponse.json({ authorizationUrl }, { status: 200 });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }

    console.error("Error processing product purchase:", error);
    return NextResponse.json(
      { message: error.message || "Error processing product purchase" },
      { status: 500 }
    );
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}//