// Select the database to use.
use('wufwuf-automations');

// Update wallet documents where type is "user" to "individual"
db.getCollection('wallets').aggregate([
    {
        $set: {
            type: {
                $cond: {
                    if: { $eq: ["$type", "user"] },
                    then: "individual",
                    else: "$type"
                }
            }
        }
    },
    {
        $project: {
            type: 1,
            userId: 1,
            workspaceId: 1,
            balances: 1,
            createdAt: {
                $ifNull: ["$createdAt", new Date()]
            }
        }
    },
    {
        $out: "wallets"
    }
]);


