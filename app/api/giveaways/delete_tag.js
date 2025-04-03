import { get_mongodb } from "../../../api-lib/mongodb";
import base from "../../../middleware";
import giveawayModel from "../../../models/giveaway.model";

const GIVEAWAY_ID =
  process.env.ENVIRONMENT === "development"
    ? process.env.GIVEAWAY_DEVT
    : process.env.GIVEAWAY_PROD;

const handler = base().delete(async (req, res) => {
  const db = await get_mongodb();

  try {
    const { tagToDelete } = req.body;

    const giveaway = await giveawayModel.findByIdAndUpdate(
      GIVEAWAY_ID,
      {
        $pull: { tags: tagToDelete },
      },
      { new: true }
    );

    if (!giveaway) {
      return res.status(404).json({ message: "Giveaway not found" });
    }

    return res.status(200).json(giveaway);
  } catch (error) {
    console.error("Error deleting tag:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default handler;
