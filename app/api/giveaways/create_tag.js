import { get_mongodb } from "../../../api-lib/mongodb";
import base from "../../../middleware";
import giveawayModel from "../../../models/giveaway.model";

const GIVEAWAY_ID =
  process.env.ENVIRONMENT === "development"
    ? process.env.GIVEAWAY_DEVT
    : process.env.GIVEAWAY_PROD;

const handler = base().put(async (req, res) => {
  const db = await get_mongodb();

  try {
    const { giveawayId, newTag } = req.body;

    const giveaway = await giveawayModel.findByIdAndUpdate(
      GIVEAWAY_ID,
      {
        $push: { tags: newTag },
      },
      { new: true }
    );

    return res.status(200).json(giveaway);
  } catch (error) {
    console.error("Error fetching entries:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default handler;
