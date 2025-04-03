import { get_mongodb } from "../../../api-lib/mongodb";
import base from "../../../middleware";
import entryModel from "../../../models/entry.model";
import { ObjectId } from "mongodb";

const handler = base().delete(async (req, res) => {
  const { entryId, tagToDelete } = req.body;

  try {
    const db = await get_mongodb();

    const entry = await entryModel.findById(entryId);

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    // Remove the tag from the tags array
    entry.tags = entry.tags.filter((tag) => tag !== tagToDelete);

    // Save the updated entry
    await entry.save();

    return res.status(200).json({ message: "Tag deleted successfully", entry });
  } catch (error) {
    console.error("Error deleting tag:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default handler;
