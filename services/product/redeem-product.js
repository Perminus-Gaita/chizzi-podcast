// services/product/redeem-product.js
import productModel from "@/models/old-product.model";
import notificationModel from "@/models/notification.model";
import userModel from "@/models/user/index.model";
import mongoose from "mongoose";
import database_connection from "@/services/database";

export async function redeemProduct(productId, userId, redemptionData) {
  await database_connection();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const product = await productModel
      .findOne({
        _id: productId,
        currentOwner: userId,
        isRedeemed: false,
      })
      .session(session);

    if (!product) {
      throw {
        message: "Product not found or not available for redemption",
        statusCode: 404,
      };
    }

    // Get user data for notification
    const redeemer = await userModel
      .findById(userId)
      .select("username")
      .session(session);
    if (!redeemer) {
      throw {
        message: "User not found",
        statusCode: 404,
      };
    }

    // Update product with redemption details
    const updatedProduct = await productModel.findByIdAndUpdate(
      productId,
      {
        isRedeemed: true,
        redemptionDetails: {
          redeemedBy: userId,
          redeemedAt: new Date(),
          shippingAddress: redemptionData.shippingAddress,
          phoneNumber: redemptionData.phoneNumber,
          status: "pending",
        },
      },
      { new: true, session }
    );

    // Create notification for the creator
    await notificationModel.create(
      [
        {
          userId: product.creator,
          recipientType: "userPersonal",
          type: "productRedemptionRequested",
          status: "info",
          message: `${redeemer.username} has redeemed ${product.name}. Action required!`,
          relatedId: product._id,
          relatedModel: "Product",
          details: `Shipping Address: ${redemptionData.shippingAddress}\nPhone Number: ${redemptionData.phoneNumber}`,
          metadata: {
            productId: product._id,
            productName: product.name,
            redeemerId: userId,
            redeemerUsername: redeemer.username,
          },
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return updatedProduct;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export async function updateRedemptionStatus(productId, userId, newStatus) {
  await database_connection();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const product = await productModel.findById(productId).session(session);
    if (!product) {
      throw {
        message: "Product not found",
        statusCode: 404,
      };
    }

    // Validate status update permissions
    if (["processing", "shipped"].includes(newStatus)) {
      if (product.creator.toString() !== userId.toString()) {
        throw {
          message: "Only the creator can update to this status",
          statusCode: 403,
        };
      }
    } else if (newStatus === "delivered") {
      if (
        product.redemptionDetails.redeemedBy.toString() !== userId.toString()
      ) {
        throw {
          message: "Only the redeemer can mark as delivered",
          statusCode: 403,
        };
      }
    }

    // Update product status
    const updatedProduct = await productModel.findByIdAndUpdate(
      productId,
      {
        "redemptionDetails.status": newStatus,
      },
      { new: true, session }
    );

    // Determine notification recipient and type
    const notificationReceiverId = ["processing", "shipped"].includes(newStatus)
      ? product.redemptionDetails.redeemedBy
      : product.creator;

    const notificationType = {
      processing: "productRedemptionProcessing",
      shipped: "productRedemptionShipped",
      delivered: "productRedemptionDelivered",
    }[newStatus];

    // Create status update notification
    await notificationModel.create(
      [
        {
          userId: notificationReceiverId,
          recipientType: "userPersonal",
          type: notificationType,
          status: "info",
          message: getStatusUpdateMessage(newStatus, product.name),
          relatedId: product._id,
          relatedModel: "Product",
          metadata: {
            productId: product._id,
            productName: product.name,
            newStatus: newStatus,
          },
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return updatedProduct;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

function getStatusUpdateMessage(status, productName) {
  const messages = {
    processing: `Your redemption of ${productName} is now being processed`,
    shipped: `${productName} has been shipped to your address`,
    delivered: `${productName} has been marked as delivered`,
  };
  return (
    messages[status] || `Status of ${productName} has been updated to ${status}`
  );
}

export async function getRedemptionStatusDetails(productId, userId) {
  await database_connection();

  const product = await productModel.findById(productId);
  if (!product) {
    throw {
      message: "Product not found",
      statusCode: 404,
    };
  }

  const isCreator = product.creator.toString() === userId.toString();
  const isRedeemer =
    product.redemptionDetails?.redeemedBy?.toString() === userId.toString();
  const currentStatus = product.redemptionDetails?.status || "not_redeemed";

  const statusFlow = {
    pending: {
      creator: ["processing"],
      redeemer: [],
    },
    processing: {
      creator: ["shipped"],
      redeemer: [],
    },
    shipped: {
      creator: [],
      redeemer: ["delivered"],
    },
    delivered: {
      creator: [],
      redeemer: [],
    },
  };

  const availableActions = isCreator
    ? statusFlow[currentStatus]?.creator || []
    : isRedeemer
    ? statusFlow[currentStatus]?.redeemer || []
    : [];

  return {
    currentStatus,
    isCreator,
    isRedeemer,
    availableActions,
    redemptionDetails: product.redemptionDetails || null,
  };
}
