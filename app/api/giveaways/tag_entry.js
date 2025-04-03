import { get_mongodb } from "../../../api-lib/mongodb";
import base from "../../../middleware";
import entryModel from "../../../models/entry.model";
import { ObjectId } from "mongodb";

const handler = base().post(async (req, res) => {
  const { entryId, tag } = req.body;

  console.log("TESETERRRR");
  console.log(entryId);

  try {
    const db = await get_mongodb();

    // check if selected tag is valid giveaway tag !!!!!

    const entry = await entryModel.findById(entryId);

    // .findOne({ _id: new ObjectId(req.user._id) });

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    // If tags array doesn't exist, create it
    if (!entry.tags) {
      entry.tags = [];
    }

    // Append the selected tag to the tags array
    entry.tags.push(tag);

    // Save the updated entry
    await entry.save();

    return res.status(200).json({ message: "Tag added successfully", entry });
  } catch (error) {
    console.error("Error updating entry:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default handler;
