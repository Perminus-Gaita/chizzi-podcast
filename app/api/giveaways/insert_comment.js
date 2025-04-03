import axios from "axios";
import { ObjectId } from "mongodb";
import { insertComment } from "../../../api-lib/db/comment";
import { get_mongodb } from "../../../api-lib/mongodb";
import base from "../../../middleware";

const handler = base().post(async (req, res) => {
  try {
    const db = await get_mongodb();

    const GIVEAWAY_ID =
      process.env.ENVIRONMENT === "development"
        ? process.env.GIVEAWAY_DEVT
        : process.env.GIVEAWAY_PROD;

    const { entryId, text } = req.body;

    // db, giveawayId, entryId, text, userId

    const new_comment = await insertComment(
      db,
      GIVEAWAY_ID,
      entryId,
      text,
      req?.user?._id
    );

    return res.json({ new_comment });
  } catch (error) {
    console.log("### Error posting comment: ###");
    console.error(error);
    return res.status(500).json({ error: "Failed to post comment." });
  }
});

export default handler;
