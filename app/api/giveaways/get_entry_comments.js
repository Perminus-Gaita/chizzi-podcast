import { ObjectId } from "mongodb";
import { getEntryComments } from "../../../api-lib/db/comment";
import { get_mongodb } from "../../../api-lib/mongodb";
import base from "../../../middleware";

const handler = base().get(async (req, res) => {
  try {
    const { entryId } = req.query; // Assuming entryId is provided as a query parameter

    const db = await get_mongodb();

    const GIVEAWAY_ID =
      process.env.ENVIRONMENT === "development"
        ? process.env.GIVEAWAY_DEVT
        : process.env.GIVEAWAY_PROD;

    const comments = await getEntryComments(db, GIVEAWAY_ID, entryId);

    res.json({ comments });
  } catch (error) {
    console.log("### Error getting comments ###");
    console.error(error);
    return res.status(500).json({ error: "Failed to get comments" });
  }
});

export default handler;
