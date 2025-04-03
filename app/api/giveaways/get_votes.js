import { getGiveawayVotes } from "../../../api-lib/db/vote";
import { get_mongodb } from "../../../api-lib/mongodb";
import base from "../../../middleware";
import voteModel from "../../../models/vote.model";

const handler = base().get(async (req, res) => {
  const db = await get_mongodb();

  try {
    const votes = await getGiveawayVotes(db, "65accf464e7234c965289a15");

    // Additional logic or data processing if needed

    if (votes.length > 0) {
      return res.status(200).json(votes);
    } else {
      return res.status(200).json([]);
    }
  } catch (error) {
    console.error("Error fetching votes:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default handler;
