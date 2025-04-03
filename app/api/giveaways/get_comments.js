import axios from "axios";
import { ObjectId } from "mongodb";
import { getComments } from "../../../api-lib/db/comment";
import { get_mongodb } from "../../../api-lib/mongodb";
import base from "../../../middleware";

const handler = base().get(async (req, res) => {
  try {
    const db = await get_mongodb();

    const GIVEAWAY_ID =
      process.env.ENVIRONMENT === "development"
        ? process.env.GIVEAWAY_DEVT
        : process.env.GIVEAWAY_PROD;

    const comments = await getComments(
      db,
      GIVEAWAY_ID
      // req.query.giveawayId
      //   req.query.before ? new Date(req.query.before) : undefined,
      //   req.query.limit ? parseInt(req.query.limit, 10) : undefined
    );

    res.json({ comments });
  } catch (error) {
    console.log("### Error getting comments ###");
    console.error(error);
    return res.status(500).json({ error: "Failed to get comments" });
  }
});

export default handler;
