import mongoose from "mongoose";
import { getUser } from "@/utils/auth/getUser";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { TournamentModel } from "@/models/tournament.model";
import productModel from "@/models/old-product.model";
import S3 from "aws-sdk/clients/s3";

import database_connection from "@/services/database";
database_connection().then(() =>
  console.log("Connected successfully (Product Create)")
);

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "ap-south-1",
  signatureVersion: "v4",
});

export async function POST(request) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sessionUser = await getUser(cookies);

    if (!sessionUser) {
      return NextResponse.json(
        { message: "No User Session Available" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const {
      name,
      description,
      price,
      inventory,
      imageFile,
      tournamentId,
      tierId,
    } = await request.json();

    console.log(
      name,
      "/n",
      "/n",
      description,
      "/n",
      price,
      "/n",
      inventory,
      "/n",
      tournamentId,
      "/n",
      tierId
    );

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { message: "Product name is required" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!price || price.amount <= 0 || price.amount > 2000000) {
      return NextResponse.json(
        { message: "Price must be between 1 and 20,000" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!tierId) {
      return NextResponse.json(
        { message: "Product must belong to a sponsorship tier" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!inventory || inventory < 1) {
      return NextResponse.json(
        { message: "Inventory must be at least 1" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if tournament exists and user is creator
    const tournament = await TournamentModel.findById(tournamentId);

    if (!tournament) {
      return NextResponse.json(
        { message: "Tournament not found" },
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    if (tournament.creator.toString() !== sessionUser._id.toString()) {
      return NextResponse.json(
        { message: "Not authorized to add products to this tournament" },
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    let imageUrl = null;
    if (imageFile) {
      // Generate S3 key for product image
      const Key = `tournaments/${tournamentId}/products/${imageFile.name}`;

      // Set up S3 params
      const s3Params = {
        Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME,
        Key,
        ContentType: imageFile.type,
        ACL: "public-read",
        Body: Buffer.from(imageFile.content, "base64"),
        Metadata: {
          userId: sessionUser._id.toString(),
          tournamentId: tournamentId,
          assetType: "product",
          originalFilename: imageFile.name,
        },
      };

      // Upload to S3
      await s3.putObject(s3Params).promise();
      imageUrl = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.ap-south-1.amazonaws.com/${Key}`;
    }

    // Create new product with enhanced fields
    const newProduct = new productModel({
      creator: new mongoose.Types.ObjectId(sessionUser._id),
      tournament: new mongoose.Types.ObjectId(tournamentId),
      name: name.trim(),
      description: description ? description.trim() : null,
      price: {
        amount: price.amount,
        currency: price.currency,
      },
      inventory,
      image: imageUrl,
      tierId,
      // type,
      // Initialize ownership tracking
      currentOwner: new mongoose.Types.ObjectId(sessionUser._id),
      ownershipHistory: [
        {
          owner: new mongoose.Types.ObjectId(sessionUser._id),
          transactionType: "created",
        },
      ],
      // Initialize tournament usage
      usedInTournaments: [
        {
          tournament: new mongoose.Types.ObjectId(tournamentId),
          usedAs: "prize",
        },
      ],
    });

    const savedProduct = await newProduct.save({ session });

    // Update tournament prize pool
    await TournamentModel.findByIdAndUpdate(
      tournamentId,
      {
        $push: {
          "prizePool.products": {
            product: savedProduct._id,
            quantity: inventory,
            value: price.amount,
          },
        },
        $inc: {
          "prizePool.totalValue": price.amount * inventory,
        },
      },
      { session }
    );

    await session.commitTransaction();

    return NextResponse.json(
      {
        message: "Product Created Successfully",
        product: savedProduct,
      },
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
