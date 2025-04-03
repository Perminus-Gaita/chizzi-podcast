// @/services/product/create-products-for-tournament.js
import mongoose from "mongoose";
import productModel from "@/models/product/index.model";
import ProductOwnershipHistory from "@/models/product/ownership-history/index.model";
import CustomError from "@/api-lib/error-handling/custom-error";
import connectToDatabaseMongoDB from '@/lib/database';
import S3 from "aws-sdk/clients/s3";

/**
 * Creates products and their ownership histories for a tournament using bulk operations
 * @param {Array} productsData - Array of product objects
 * @param {Object} sessionUser - User session object
 * @returns {Promise<Array>} Array of products with their ownership histories
 */

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "ap-south-1",
  signatureVersion: "v4",
});

export async function createProductsForTournament(productsData, sessionUser) {
  // Connect to database inside the functions nextjs
  await connectToDatabaseMongoDB("api/products/create-for-tournament");

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = sessionUser._id;
    
    // Arrays to store all documents for bulk insertion
    const productDocuments = [];
    const initialOwnershipDocuments = [];
    const tournamentOwnershipDocuments = [];
    
    // Map to store product data for result creation
    const productMap = new Map();

    // First, check for any existing products to fail early
    const groupAndNames = productsData.map(p => ({
      initialOwner: userId,
      groupName: p.groupName,
      name: p.name
    }));
    
    // Bulk check for existing products
    const existingProducts = await productModel.find({
      $or: groupAndNames
    }).lean();
    
    if (existingProducts.length > 0) {
      const existing = existingProducts[0];
      throw new CustomError(
        `Product with the same name '${existing.name}' and group name '${existing.groupName}' exists for this owner`,
        400
      );
    }

    // Upload image if provided with the first product
    let imageUrl = null;
    if (productsData.length > 0 && productsData[0].image && productsData[0].image.content) {
      const firstProduct = productsData[0];
      const tournamentId = firstProduct.tournamentId;
      const timestamp = Date.now();
      const Key = `tournaments/${tournamentId}/products/${timestamp}-${firstProduct.image.name}`;
      
      const s3Params = {
        Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME,
        Key,
        ContentType: firstProduct.image.type,
        ACL: "public-read",
        Body: Buffer.from(firstProduct.image.content, 'base64'),
        Metadata: {
          userId: userId.toString(),
          tournamentId: tournamentId,
          assetType: "product",
          originalFilename: firstProduct.image.name,
        },
      };
      
      await s3.putObject(s3Params).promise();
      imageUrl = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.ap-south-1.amazonaws.com/${Key}`;
      console.log("Image uploaded to S3:", imageUrl);
    }

    // Process each product
    for (const productData of productsData) {
      // Pre-generate IDs for all documents
      const productId = new mongoose.Types.ObjectId();
      const initialOwnershipId = new mongoose.Types.ObjectId();
      const tournamentOwnershipId = new mongoose.Types.ObjectId();

      // Create product document
      const product = {
        _id: productId,
        name: productData.name,
        groupName: productData.groupName,
        image: imageUrl || (typeof productData.image === 'string' ? productData.image : null),
        description: productData.description || null,
        type: productData.type,
        initialOwner: userId,
        featured: false,
        currentOwner: tournamentOwnershipId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      productDocuments.push(product);

      // Create initial ownership document
      const initialOwnership = {
        _id: initialOwnershipId,
        productId: productId,
        currentOwnerId: userId,
        currentOwnerModel: "User",
        previousOwnerId: null,
        previousOwnerModel: null,
        previousOwnershipRecord: null,
        transferType: "initial",
        price: {
          amount: productData.price.amount,
          currency: productData.price.currency,
        },
        addedBy: userId,
        startDate: new Date(),
        endDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      initialOwnershipDocuments.push(initialOwnership);

      // Create tournament ownership document
      const tournamentOwnership = {
        _id: tournamentOwnershipId,
        productId: productId,
        currentOwnerId: productData.tournamentId,
        currentOwnerModel: "Tournament",
        previousOwnerId: userId,
        previousOwnerModel: "User",
        previousOwnershipRecord: initialOwnershipId,
        transferType: "tournamentListing",
        price: {
          amount: productData.price.amount,
          currency: productData.price.currency,
        },
        tierId: productData.tierId,
        startDate: new Date(),
        endDate: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      tournamentOwnershipDocuments.push(tournamentOwnership);

      // Store product data for result
      productMap.set(productId.toString(), {
        ...product,
        ownershipHistory: [initialOwnership, tournamentOwnership]
      });
    }

    // Execute bulk inserts within transaction
    if (productDocuments.length > 0) {
      await productModel.insertMany(productDocuments, { session });
      console.log(`Bulk inserted ${productDocuments.length} products`);
    }

    if (initialOwnershipDocuments.length > 0) {
      await ProductOwnershipHistory.insertMany(initialOwnershipDocuments, { session });
      console.log(`Bulk inserted ${initialOwnershipDocuments.length} initial ownerships`);
    }

    if (tournamentOwnershipDocuments.length > 0) {
      await ProductOwnershipHistory.insertMany(tournamentOwnershipDocuments, { session });
      console.log(`Bulk inserted ${tournamentOwnershipDocuments.length} tournament ownerships`);
    }

    // Commit the transaction
    await session.commitTransaction();
    console.log("Transaction committed successfully");

    // Create result array
    const result = Array.from(productMap.values());
    return result;

  } catch (error) {
    // Rollback the transaction on error
    await session.abortTransaction();

    console.log({ error });
    if (error instanceof CustomError) {
      throw error;
    }

    throw new CustomError(
      error.message || "Error creating products for tournament",
      error.statusCode || 500
    );
  } finally {
    session.endSession();
  }
}