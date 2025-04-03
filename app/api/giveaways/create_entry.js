// Import necessary modules
import { ObjectId } from "mongodb";

import { get_mongodb } from "../../../api-lib/mongodb";
import base from "../../../middleware";
import entryModel from "../../../models/entry.model";

// Define the handler function
const handler = base().post(async (req, res) => {
  // Extract data from the request body
  const {
    profilePicture,
    username,
    platform,
    linkToProfile,
    linkToPost,
    progress,
  } = req.body;

  try {
    // Connect to MongoDB
    const db = await get_mongodb();

    // Create a new entry document
    const newEntry = new entryModel({
      profilePicture,
      username,
      platform,
      linkToProfile,
      linkToPost,
      progress,
      giveawayId: ObjectId("65b62701ef540493c797a5c7"),
    });

    // Save the new entry document
    await newEntry.save();

    return res
      .status(201)
      .json({ message: "Entry created successfully", newEntry });
  } catch (error) {
    console.error("Error creating entry:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Export the handler
export default handler;
