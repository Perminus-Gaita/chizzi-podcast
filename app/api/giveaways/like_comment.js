import axios from "axios";
import { ObjectId } from "mongodb";
import { insertComment, likeComment } from "../../../api-lib/db/comment";
import { get_mongodb } from "../../../api-lib/mongodb";
import base from "../../../middleware";

const handler = base().patch(async (req, res) => {
  try {
    // if (!req.user) {
    //   res.status(401).end();
    //   return;
    // }

    const { commentId, userId } = req.body;

    //   console.log(comment_id, "==> ", userId);

    const db = await get_mongodb();

    const updatedComment = await likeComment(db, commentId, userId);

    res.json({ updatedComment });
  } catch (error) {
    console.log("### Error posting comment: ###");
    console.error(error);
    return res.status(500).json({ error: "Failed to post comment." });
  }
});

export default handler;
