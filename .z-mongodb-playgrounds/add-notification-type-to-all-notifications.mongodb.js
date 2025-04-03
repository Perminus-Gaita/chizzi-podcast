// import mongoose from 'mongoose';
// const { ObjectId } = mongoose.Types;

// Select the database to use.
use('wufwuf-automations-test');


// Insert a few documents into the sales collection.
db.getCollection('notifications').aggregate([
  {$match: { type: { $exists: false }}},
  {$addFields: {
    type: {$switch: {
      branches: [
            { case: { $eq: ["$status", "success"] }, then: "successPublishingPost" },
            { case: { $eq: ["$status", "error"] }, then: "errorPublishingPost" },
            { case: { $eq: ["$status", "info"] }, then: "newWorkspaceInvite" }
          ],
          default: "unknownType"
        }
      }
    }
  },
  {
    $merge: {
      into: "notifications",
      on: "_id",
      whenMatched: "merge",
      whenNotMatched: "discard"
    }
  }
]);
