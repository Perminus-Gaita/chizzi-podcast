import UserModel from "@/models/user/index.model";
import connectToDatabaseMongoDB from "@/lib/database";

await connectToDatabaseMongoDB("getUserProducts");

export async function getUserProducts(username, sessionUserId) {
  try {
    if (!username) {
      const error = new Error('Username is required');
      error.statusCode = 400;
      throw error;
    }

    const products = await UserModel.aggregate([
      // Match the user by username
      { $match: { username: username } },
      
      // Lookup products where user is either creator or current owner
      {
        $lookup: {
          from: "products",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $or: [
                  { $expr: { $eq: ["$creator", "$$userId"] } },
                  { $expr: { $eq: ["$currentOwner", "$$userId"] } }
                ]
              }
            },
            // Lookup creator details
            {
              $lookup: {
                from: "users",
                localField: "creator",
                foreignField: "_id",
                as: "creatorDetails"
              }
            },
            { $unwind: "$creatorDetails" },
            
            // Lookup current owner details
            {
              $lookup: {
                from: "users",
                localField: "currentOwner",
                foreignField: "_id",
                as: "ownerDetails"
              }
            },
            { $unwind: { path: "$ownerDetails", preserveNullAndEmptyArrays: true } },
            
            // Lookup and process ownership history
            {
              $lookup: {
                from: "users",
                localField: "ownershipHistory.owner",
                foreignField: "_id",
                as: "historyOwners"
              }
            },
            {
              $addFields: {
                ownershipHistory: {
                  $map: {
                    input: "$ownershipHistory",
                    as: "history",
                    in: {
                      owner: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$historyOwners",
                              cond: { $eq: ["$$this._id", "$$history.owner"] }
                            }
                          },
                          0
                        ]
                      },
                      acquiredAt: "$$history.acquiredAt",
                      transactionType: "$$history.transactionType"
                    }
                  }
                }
              }
            },
            
            // Project the final product structure.
            {
              $project: {
                _id: { $toString: "$_id" },
                name: 1,
                description: 1,
                price: 1,
                image: 1,
                inventory: 1,
                sold: 1,
                isRedeemed: 1,
                redemptionDetails: 1,
                transferCount: 1,
                tournamentWins: 1,
                creator: {
                  _id: { $toString: "$creatorDetails._id" },
                  name: "$creatorDetails.name",
                  username: "$creatorDetails.username",
                  profilePicture: "$creatorDetails.profilePicture",
                  isSessionUser: {
                    $cond: {
                      if: { $eq: ["$creatorDetails._id", sessionUserId] },
                      then: true,
                      else: false
                    }
                  }
                },
                currentOwner: {
                  _id: { $toString: "$ownerDetails._id" },
                  name: "$ownerDetails.name",
                  username: "$ownerDetails.username",
                  profilePicture: "$ownerDetails.profilePicture",
                  isSessionUser: {
                    $cond: {
                      if: { $eq: ["$ownerDetails._id", sessionUserId] },
                      then: true,
                      else: false
                    }
                  }
                },
                // Inside the final $project stage, update the ownershipHistory mapping:
                ownershipHistory: {
                  $map: {
                    input: "$ownershipHistory",
                    as: "history",
                    in: {
                      owner: {
                        _id: { $toString: "$$history.owner._id" },
                        name: "$$history.owner.name",
                        username: "$$history.owner.username",
                        profilePicture: "$$history.owner.profilePicture"
                      },
                      acquiredAt: { $toString: "$$history.acquiredAt" },
                      transactionType: "$$history.transactionType",
                      isSessionUser: {
                        $cond: {
                          if: { $eq: ["$$history.owner._id", sessionUserId] },
                          then: true,
                          else: false
                        }
                      }
                    }
                  }
                }
              }
            }
          ],
          as: "products"
        }
      },
      
      // Only return the products array
      {
        $project: {
          _id: 0,
          products: 1
        }
      }
    ]);

    // Return empty array if no products found
    if (!products || products.length === 0) {
      return [];
    }

    return products[0].products;
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = error.message || 'Error fetching user products';
    }
    console.error(`Error getting products for user ${username}:`, error);
    throw error;
  }
}