import { ObjectId } from "mongodb";
import { get_mongodb } from "../../../api-lib/mongodb";
import base from "../../../middleware";
import entryModel from "../../../models/entry.model";

const handler = base().post(async (req, res) => {
  const { linkToPost } = req.body;

  try {
    // Connect to MongoDB
    const db = await get_mongodb();

    // Create a new entry document with only linkToPost
    const newEntry = new entryModel({
      linkToPost,
      giveawayId: ObjectId("65b62701ef540493c797a5c7"),
    });

    // Save the new entry document
    await newEntry.save();

    return res
      .status(201)
      .json({ message: "LinkToPost added successfully", newEntry });
  } catch (error) {
    console.error("Error adding LinkToPost:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default handler;
