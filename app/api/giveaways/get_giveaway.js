import { get_mongodb } from "../../../api-lib/mongodb";
import base from "../../../middleware";
import giveawayModel from "../../../models/giveaway.model";
import { ObjectId } from "mongodb";

const GIVEAWAY_ID =
  process.env.ENVIRONMENT === "development"
    ? process.env.GIVEAWAY_DEVT
    : process.env.GIVEAWAY_PROD;

const handler = base().get(async (req, res) => {
  const db = await get_mongodb();

  try {
    // const giveawayId = req.query.giveawayId;

    // Ensure giveawayId is a valid ObjectId
    if (!ObjectId.isValid(GIVEAWAY_ID)) {
      return res.status(400).json({ message: "Invalid giveaway ID" });
    }

    // Find the giveaway by ID
    const giveaway = await giveawayModel.findById(GIVEAWAY_ID);

    if (!giveaway) {
      return res.status(404).json({ message: "Giveaway not found" });
    }

    return res.status(200).json(giveaway);
  } catch (error) {
    console.error("Error fetching giveaway by ID:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default handler;
