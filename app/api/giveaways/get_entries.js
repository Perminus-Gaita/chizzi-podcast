// import { get_mongodb } from "../../../api-lib/mongodb";
// import base from "../../../middleware";
// import entryModel from "../../../models/entry.model";

// const handler = base().get(async (req, res) => {
//   const db = await get_mongodb();

//   try {
//     const entries = await entryModel.find();

//     // Additional logic or data processing if needed

//     if (entries.length > 0) {
//       return res.status(200).json(entries);
//     } else {
//       return res.status(200).json([]);
//     }
//   } catch (error) {
//     console.error("Error fetching entries:", error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// });

// export default handler;

import { get_mongodb } from "../../../api-lib/mongodb";
import base from "../../../middleware";
import entryModel from "../../../models/entry.model";

const handler = base().get(async (req, res) => {
  const db = await get_mongodb();

  try {
    const { giveawayId } = req.query;

    if (!giveawayId) {
      return res.status(400).json({ message: "Giveaway ID is required" });
    }

    // Use the giveawayId in the query to fetch entries
    const entries = await entryModel.find({ giveawayId });

    // Additional logic or data processing if needed

    if (entries.length > 0) {
      return res.status(200).json(entries);
    } else {
      return res.status(200).json([]);
    }
  } catch (error) {
    console.error("Error fetching entries:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default handler;
