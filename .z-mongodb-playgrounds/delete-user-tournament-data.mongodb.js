// Use the appropriate database
use('wufwuf-automations-test');

const userId = "67385e310ad454168de1ed6d";

// 1. Find all tournaments created by the user
const userTournaments = db.getCollection('tournaments').aggregate([
  {
    $match: {
      creator: ObjectId(userId)
    }
  }
]).toArray();

const tournamentIds = userTournaments.map(t => t._id);

// 2. Delete all participants in those tournaments
db.getCollection('participants').deleteMany({
  tournamentId: { $in: tournamentIds }
});

// 3. Delete all sponsorships for those tournaments
db.getCollection('sponsorships').deleteMany({
  $or: [
    { tournamentId: { $in: tournamentIds } },
    { sponsorId: ObjectId(userId) }
  ]
});

// 4. Delete all transactions related to the user
db.getCollection('transactions').deleteMany({
  $or: [
    { userId: ObjectId(userId) },
    {
      type: {
        $in: [
          "tournamentBuyIn",
          "tournamentPayOut",
          "tournamentRefund",
          "tournamentCancelled",
          "tournamentPrize"
        ]
      },
      gameId: { $in: tournamentIds }
    }
  ]
});

// 5. Finally delete the tournaments
db.getCollection('tournaments').deleteMany({
  _id: { $in: tournamentIds }
});

// Alternative Aggregation Pipeline Approach
db.getCollection('tournaments').aggregate([
  // Match tournaments by creator
  {
    $match: {
      creator: ObjectId(userId)
    }
  },
  // Gather tournament IDs for cleanup
  {
    $group: {
      _id: null,
      tournamentIds: { $push: "$_id" }
    }
  },
  // Perform cleanup operations
  {
    $lookup: {
      from: "participants",
      let: { tournamentIds: "$tournamentIds" },
      pipeline: [
        {
          $match: {
            $expr: {
              $in: ["$tournamentId", "$$tournamentIds"]
            }
          }
        },
        {
          $project: {
            _id: 1
          }
        }
      ],
      as: "participantsToDelete"
    }
  },
  {
    $lookup: {
      from: "sponsorships",
      let: { tournamentIds: "$tournamentIds" },
      pipeline: [
        {
          $match: {
            $or: [
              {
                $expr: {
                  $in: ["$tournamentId", "$$tournamentIds"]
                }
              },
              {
                sponsorId: ObjectId(userId)
              }
            ]
          }
        },
        {
          $project: {
            _id: 1
          }
        }
      ],
      as: "sponsorshipsToDelete"
    }
  },
  {
    $lookup: {
      from: "transactions",
      let: { tournamentIds: "$tournamentIds" },
      pipeline: [
        {
          $match: {
            $or: [
              { userId: ObjectId(userId) },
              {
                $and: [
                  {
                    type: {
                      $in: [
                        "tournamentBuyIn",
                        "tournamentPayOut",
                        "tournamentRefund",
                        "tournamentCancelled",
                        "tournamentPrize"
                      ]
                    }
                  },
                  {
                    $expr: {
                      $in: ["$gameId", "$$tournamentIds"]
                    }
                  }
                ]
              }
            ]
          }
        },
        {
          $project: {
            _id: 1
          }
        }
      ],
      as: "transactionsToDelete"
    }
  },
  // Output the IDs to be deleted
  {
    $project: {
      tournamentIds: 1,
      participantIds: "$participantsToDelete._id",
      sponsorshipIds: "$sponsorshipsToDelete._id",
      transactionIds: "$transactionsToDelete._id"
    }
  }
]);