import mongoose from "mongoose";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Always use development database for testing
const MONGODB_URI = process.env.MONGO_URI_DEVELOPMENT;

// Get directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import models using dynamic imports
const getModels = async () => {
  const productModel = (await import("../models/old-product.model.js")).default;
  const userModel = (await import("../models/user/index.model.js")).default;
  const notificationModel = (await import("../models/notification.model.js"))
    .default;
  return { productModel, userModel, notificationModel };
};

async function connectToDatabase() {
  try {
    if (!MONGODB_URI) {
      throw new Error(
        "Development MongoDB URI is not defined in environment variables. Please check your .env file."
      );
    }

    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("🟢 Connected to development database");
  } catch (error) {
    console.error("🔴 Database connection error:", error);
    throw error;
  }
}

async function setupTestData(models) {
  const { productModel, userModel } = models;
  try {
    console.log("🔵 Setting up test data...");

    // Create test users
    const creator = await userModel.create({
      name: "Test Creator",
      username: "testcreator",
      type: "individual",
    });
    console.log("🟢 Created test creator:", creator.username);

    const owner = await userModel.create({
      name: "Test Owner",
      username: "testowner",
      type: "individual",
    });
    console.log("🟢 Created test owner:", owner.username);

    // Create test product
    const product = await productModel.create({
      name: "Test Product",
      description: "A product for testing redemption flow",
      price: 100,
      image: "/test-image.jpg",
      inventory: 1,
      creator: creator._id,
      currentOwner: owner._id,
      isRedeemed: false,
      tierId: "test123", // Required field
    });
    console.log("🟢 Created test product:", product.name);

    console.log("\n🔵 Test Setup Complete! Use these IDs for testing:");
    console.log("Creator ID:", creator._id);
    console.log("Owner ID:", owner._id);
    console.log("Product ID:", product._id);

    return {
      creator,
      owner,
      product,
    };
  } catch (error) {
    console.error("🔴 Error setting up test data:", error);
    throw error;
  }
}

async function testRedemptionFlow(testData, models) {
  const { productModel, notificationModel } = models;
  try {
    console.log("\n🔵 Starting Redemption Flow Test");

    // 1. Simulate product redemption
    const updatedProduct = await productModel.findByIdAndUpdate(
      testData.product._id,
      {
        isRedeemed: true,
        redemptionDetails: {
          redeemedBy: testData.owner._id,
          redeemedAt: new Date(),
          shippingAddress: "123 Test Street",
          phoneNumber: "1234567890",
          status: "pending",
        },
      },
      { new: true }
    );
    console.log("🟢 Product redeemed:", updatedProduct.redemptionDetails);

    // 2. Check creator notification
    const creatorNotification = await notificationModel.create({
      userId: testData.creator._id,
      type: "productRedemptionRequest",
      status: "info",
      message: `${testData.owner.username} has redeemed ${testData.product.name}`,
      relatedId: testData.product._id,
      relatedModel: "Product",
    });
    console.log("🟢 Creator notification created");

    // 3. Simulate status updates
    const statuses = ["processing", "shipped", "delivered"];
    for (const status of statuses) {
      console.log(`\n🔵 Testing status update to: ${status}`);

      // Update product status
      const statusUpdate = await productModel.findByIdAndUpdate(
        testData.product._id,
        {
          "redemptionDetails.status": status,
        },
        { new: true }
      );
      console.log("🟢 Status updated:", statusUpdate.redemptionDetails.status);

      // Create notification for status change
      const notificationReceiver = ["processing", "shipped"].includes(status)
        ? testData.owner._id
        : testData.creator._id;

      await notificationModel.create({
        userId: notificationReceiver,
        type: "productRedemptionStatusUpdate",
        status: "info",
        message: `Product status updated to ${status}`,
        relatedId: testData.product._id,
        relatedModel: "Product",
      });
      console.log("🟢 Status update notification created");

      // Small delay between updates
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log("\n🟢 All test scenarios completed successfully!");
  } catch (error) {
    console.error("🔴 Error during redemption flow test:", error);
    throw error;
  }
}

async function cleanupTestData(testData, models) {
  const { productModel, userModel, notificationModel } = models;
  try {
    console.log("\n🔵 Cleaning up test data...");

    // Delete test notifications
    await notificationModel.deleteMany({
      relatedId: testData.product._id,
    });

    // Delete test product
    await productModel.findByIdAndDelete(testData.product._id);

    // Delete test users
    await userModel.deleteMany({
      _id: {
        $in: [testData.creator._id, testData.owner._id],
      },
    });

    console.log("🟢 Test data cleaned up successfully!");
  } catch (error) {
    console.error("🔴 Error cleaning up test data:", error);
    throw error;
  }
}

// Run the full test flow
async function runTests() {
  let testData;
  try {
    console.log("🔵 Starting Test Suite\n");

    await connectToDatabase();
    const models = await getModels();

    testData = await setupTestData(models);
    await testRedemptionFlow(testData, models);

    // Comment out this line if you want to keep test data
    await cleanupTestData(testData, models);

    console.log("\n✅ Test Suite Completed Successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Test Suite Failed:", error);
    if (testData) {
      const models = await getModels();
      await cleanupTestData(testData, models).catch(console.error);
    }
    process.exit(1);
  }
}

// Run the tests
runTests();
