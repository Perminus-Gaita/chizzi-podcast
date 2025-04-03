import axios from "axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUserSession } from "@/services/auth/get-user-session";
import SponsorshipModel from "@/models/payments/sponsorship.model";
import { TournamentModel } from "@/models/tournament.model";
import { validateRequestBody } from "@/api-lib/validation/validate-request-body";


export async function POST(request) {
  try {
    // Get user session
    const sessionUser = await getUserSession(cookies, true);

    const requestBody = await validateRequestBody(request, {
      tournamentId: true,
      amount: true,
      currency: true,
      type: true,
      message: false,
      callbackUrl: true
    });

    // Get data to create sponsorship document
    const sponsorshipData = {
      sponsorId: sessionUser._id,
      tournamentId: requestBody.tournamentId,
      status: "initiated",
      amount: requestBody.amount,
      currency: requestBody.currency,
      type: requestBody.type,
      message: requestBody.message,
      paymentMethod: "pending",
    };

    // create sponsorhip document
    const sponsorshipDocument = await createSponsorshipDocument(
      sponsorshipData
    );

    // Get tournament details
    const tournamentDetails = await getTournamentDetails(
      requestBody.tournamentId
    );

    // Calculate if this payment will reach the target
    const willReachTarget =
      tournamentDetails.currentAmount + requestBody.amount >=
      tournamentDetails.targetAmount;

    console.log(tournamentDetails.currentAmount);
    console.log(tournamentDetails.targetAmount);
    console.log(willReachTarget);

    // Get data to initiate paystack transaction
    const paystackTransactionData = {
      email:
        sessionUser?.mainEmail ||
        sessionUser?.google?.email ||
        `${sessionUser.username}@username.wufwuf.io`,
      amount: sponsorshipDocument.amount,
      currency: sponsorshipDocument.currency,
      reference: sponsorshipDocument._id,
      callbackUrl: requestBody.callbackUrl,
      channels: ["card", "mobile_money"],
      metadata: {
        sponsor: {
          _id: sessionUser?._id,
          name: sessionUser?.name,
          username: sessionUser?.username,
          type: sessionUser?.type,
          profilePicture: sessionUser?.profilePicture,
          currentWorkspace: sessionUser?.currentWorkspace
        },
        tournament: {
          _id: requestBody.tournamentId,
          creatorId: tournamentDetails.creatorId,
          telegramGroupId: tournamentDetails.telegramGroupId,
          targetAmount: tournamentDetails.targetAmount,
          currentAmount: tournamentDetails.currentAmount,
        },
        // used by evenbridge dont put it in an object
        paymentType: "sponsorship",
        sponsorshipType: "direct",
        paymentDetails:{
          sponsorshipId: sponsorshipDocument._id,
          // creatorAmount,
          // tournamentAmount,
          // platformFee,
        },
        startTournament: willReachTarget,
      },
    };

    // initialize paystack transaction that creates a sponsorship
    const { authorizationUrl } = await initializeTransaction(
      paystackTransactionData
    );

    return NextResponse.json(
      { authorizationUrl: authorizationUrl },
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error initializing sponsorship payment:", error);
    const errorMessage = error.message;
    return NextResponse.json(
      {
        message:
          errorMessage ||
          "Internal Server Error initializing sponsorship payment",
      },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// create a sponsorship document
const createSponsorshipDocument = async (data) => {
  try {
    const newSponsorship = new SponsorshipModel({
      sponsorId: data.sponsorId,
      tournamentId: data.tournamentId,
      status: data.status,
      amount: data.amount,
      currency: data.currency,
      type: data.type,
      message: data.message,
      paymentMethod: data.paymentMethod,
      walletId: data.walletId,
    });

    const savedSponsorship = await newSponsorship.save();
    return savedSponsorship;
  } catch (error) {
    console.error("Error creating sponsorship:", error);
    throw error;
  }
};

// initialize transaction that creates a sponsorship
async function initializeTransaction(paystackTransactionData) {
  const url = "https://api.paystack.co/transaction/initialize";
  const YOUR_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY; // Replace with your actual secret key

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

    const responseData = response.data;

    return {
      authorizationUrl: responseData.data.authorization_url,
      accessCode: responseData.data.access_code,
      reference: responseData.data.reference,
    };
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}
