// import mongoose from 'mongoose';
// const { ObjectId } = mongoose.Types;

// Select the database to use.
use('wufwuf-automations-test');


// Insert a few documents into the sales collection.
db.getCollection('workspaces').aggregate([
  // {
  //   $addFields: {
  //     members: {
  //       $map: {
  //         input: "$users",
  //         as: "userObj",
  //         in: {
  //           userId: "$$userObj.user",
  //           role: "$$userObj.role"
  //         }
  //       }
  //     }
  //   }
  // },
  {
    $unset: "usersgg"
  },
  // {
  //   $merge: {
  //     into: "workspaces",
  //     on: "_id",
  //     whenMatched: "replace",
  //     whenNotMatched: "discard"
  //   }
  // }
]);
