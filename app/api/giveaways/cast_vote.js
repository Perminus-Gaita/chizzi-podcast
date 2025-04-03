// // Import necessary modules
// import { get_mongodb } from "../../../api-lib/mongodb";
// import base from "../../../middleware";
// import entryModel from "../../../models/entry.model";

// // Define the handler function
// const handler = base().post(async (req, res) => {
//   const { entryId, userId } = req.body;

//   try {
//     // Connect to MongoDB
//     const db = await get_mongodb();

//     // Find the entry by ID
//     const entry = await entryModel.findById(entryId);

//     if (!entry) {
//       return res.status(404).json({ message: "Entry not found" });
//     }

//     // Ensure the 'votes' array exists in the entry
//     if (!entry.votes) {
//       entry.votes = [];
//     }

//     // Check if the user has already voted for this entry
//     if (entry.votes.includes(userId)) {
//       return res
//         .status(400)
//         .json({ message: "User has already voted for this entry" });
//     }

//     // Check if the user has reached the maximum vote limit (5 votes across all entries)
//     const userTotalVotes = await entryModel.countDocuments({
//       votes: userId,
//     });

//     if (userTotalVotes >= 5) {
//       return res
//         .status(400)
//         .json({ message: "You've reached the maximum vote limit" });
//     }

//     // Add the user's vote
//     entry.votes.push(userId);

//     // Save the updated entry
//     await entry.save();

//     return res.status(200).json({ message: "Vote cast successfully", entry });
//   } catch (error) {
//     console.error("Error casting vote:", error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// });

// // Export the handler
// export default handler;

// Import necessary modules
import { get_mongodb } from "../../../api-lib/mongodb";
import base from "../../../middleware";
import entryModel from "../../../models/entry.model";
import voteModel from "../../../models/vote.model";

// Define the handler function
const handler = base().post(async (req, res) => {
  const { entryId, userId } = req.body;

  try {
    // Connect to MongoDB
    const db = await get_mongodb();

    // Check if the user has already voted for this entry
    const existingVote = await voteModel.findOne({
      entryId,
      userId,
    });

    if (existingVote) {
      return res
        .status(400)
        .json({ message: "User has already voted for this entry" });
    }

    // Check if the user has reached the maximum vote limit (5 votes across all entries)
    const userTotalVotes = await voteModel.countDocuments({
      userId,
    });

    if (userTotalVotes >= 5) {
      return res
        .status(400)
        .json({ message: "You've reached the maximum vote limit" });
    }

    // Create a new vote object
    const newVote = new voteModel({
      giveawayId: "65accf464e7234c965289a15",
      entryId,
      userId,
    });

    // Save the new vote
    await newVote.save();

    return res.status(200).json({ message: "Vote cast successfully", newVote });
  } catch (error) {
    console.error("Error casting vote:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Export the handler
export default handler;
