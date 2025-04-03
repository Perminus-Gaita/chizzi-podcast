/* global use, db */
// MongoDB Playground
// To disable this template go to Settings | MongoDB | Use Default Template For Playground.
// Make sure you are connected to enable completions and to be able to run a playground.
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.
// The result of the last command run in a playground is shown on the results panel.
// By default the first 20 documents will be returned with a cursor.
// Use 'console.log()' to print to the debug output.
// For more documentation on playgrounds please refer to
// https://www.mongodb.com/docs/mongodb-vscode/playgrounds/

// Select the database to use.
use('wufwuf-automations');
// db.getCollection('users').aggregate([

// 1. creates workspaces for users without one
// db.getCollection('users').aggregate([
//     // Stage 1: Match users without currentWorkspace
//     {
//       $match: {
//         currentWorkspace: { $exists: false }
//       }
//     },
    
//     // Stage 2: Create a new workspace document for each user
//     {
//       $project: {
//           _id: 0,  // Generate a new ObjectId based on user's _id
//           name: { $ifNull: ["$name", "New Workspace"] },
//           username: { $ifNull: ["$username", { $concat: ["user", { $substr: [{ $toString: "$_id" }, 0, 6] }] }] },
//           creator: "$_id",
//           users: [{ user: "$_id", role: "admin" }],
//           profilePicture: { $ifNull: ["$profilePicture", null] },
//           createdAt: new Date()
        
//       }
//     },
    
//     // Stage 3: Output the new workspace documents to the workspaces collection
//     {
//       $merge: {
//         into: "workspaces",
//         on: "_id",
//         whenMatched: "keepExisting",
//         whenNotMatched: "insert"
//       }
//     },
    
//     // // Stage 4: Update the user document with the new workspace ID
//     // {
//     //   $project: {
//     //     userId: "$workspace.creator",
//     //     currentWorkspace: "$workspace._id"
//     //   }
//     // }//,
    
//     // Stage 5: Merge the updates back into the users collection
//     // {
//     //   $merge: {
//     //     into: "users",
//     //     on: "_id",
//     //     whenMatched: "merge",
//     //     whenNotMatched: "discard"
//     //   }
//     // }
// ])

// 2. adds currentWorkspace field to users without the field
// db.getCollection('users').aggregate([
//   // Stage 1: Match users without currentWorkspace
//   {
//     $match: {
//       currentWorkspace: { $exists: false }
//     }
//   },
  
//   // Stage 2: Look up the workspace where the user is the creator
//   {
//     $lookup: {
//       from: "workspaces",
//       let: { userId: "$_id" },
//       pipeline: [
//         {
//           $match: {
//             $expr: { $eq: ["$creator", "$$userId"] }
//           }
//         },
//         {
//           $project: {
//             _id: 1
//           }
//         }
//       ],
//       as: "workspace"
//     }
//   },
  
//   // Stage 3: Unwind the workspace array (it should only have one element)
//   {
//     $unwind: {
//       path: "$workspace",
//       preserveNullAndEmptyArrays: true
//     }
//   },
  
//   // Stage 4: Add the currentWorkspace field
//   {
//     $addFields: {
//       currentWorkspace: "$workspace._id"
//     }
//   },
  
//   // Stage 5: Remove the temporary workspace field
//   {
//     $project: {
//       workspace: 0
//     }
//   },
  
//   // Stage 6: Merge the updates back into the users collection
//   {
//     $merge: {
//       into: "users",
//       on: "_id",
//       whenMatched: "merge",
//       whenNotMatched: "discard"
//     }
//   }
// ])

// // 3. adds wallet to users without one
// db.getCollection('users').aggregate([
//   // Stage 1: Look up existing wallets for users
//   {
//     $lookup: {
//       from: "wallets",
//       let: { userId: "$_id" },
//       pipeline: [
//         {
//           $match: {
//             $expr: {
//               $and: [
//                 { $eq: ["$type", "user"] },
//                 { $eq: ["$userId", "$$userId"] }
//               ]
//             }
//           }
//         }
//       ],
//       as: "wallet"
//     }
//   },
  
//   // Stage 2: Filter users without wallets
//   {
//     $match: {
//       wallet: { $size: 0 }
//     }
//   },
  
//   // Stage 3: Create wallet document
//   {
//     $project: {
//       _id: 0,  // Generate a new ObjectId for the wallet
//       type: "user",
//       userId: "$_id",
//       balance: { $literal: 0 },
//       currency: "KES",
//       createdAt: new Date()
//     }
//   },
  
//   // Stage 4: Insert new wallets into the wallets collection
//   {
//     $merge: {
//       into: "wallets",
//       on: "_id",
//       whenMatched: "keepExisting",
//       whenNotMatched: "insert"
//     }
//   }
// ]);

// // 4. adds wallet to workspaces without one
// db.getCollection('workspaces').aggregate([
//   // Stage 1: Look up existing wallets for workspaces
//   {
//     $lookup: {
//       from: "wallets",
//       let: { workspaceId: "$_id" },
//       pipeline: [
//         {
//           $match: {
//             $expr: {
//               $and: [
//                 { $eq: ["$type", "workspace"] },
//                 { $eq: ["$workspaceId", "$$workspaceId"] }
//               ]
//             }
//           }
//         }
//       ],
//       as: "wallet"
//     }
//   },
  
//   // Stage 2: Filter workspaces without wallets
//   {
//     $match: {
//       wallet: { $size: 0 }
//     }
//   },
  
//   // Stage 3: Create wallet document
//   {
//     $project: {
//       _id: 0,  // Generate a new ObjectId for the wallet
//       type: "workspace",
//       workspaceId: "$_id",
//       balance: { $literal: 0 },
//       currency: "KES",
//       createdAt: new Date()
//     }
//   },
  
//   // Stage 4: Insert new wallets into the wallets collection
//   {
//     $merge: {
//       into: "wallets",
//       on: "_id",
//       whenMatched: "keepExisting",
//       whenNotMatched: "insert"
//     }
//   }
// ]);

