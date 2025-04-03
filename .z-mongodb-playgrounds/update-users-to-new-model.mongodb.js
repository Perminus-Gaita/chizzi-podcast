// Select the database to use.
use('wufwuf-automations-test');

// insert a few documents into the sales collection
db.getCollection('users').aggregate([
    { $addFields: {
        type: "individual",
          
        // Add workspace fields
        creator: "$_id",
        members: [{
            userId: "$_id",
            role: "admin"
        }],
        mainEmail: "$google.email",
    }},
    { $project: {
        name: "$name",
        username: "$username",
        type: "$type",
        currentWorkspaceId: "$_id",
        onboardingStatus: "$onboardingStatus",
        accountType: "$accountType",
        discovery: "$discovery",
        profilePicture: "$profilePicture",
        mainEmail: "$mainEmail",
        providers: "$providers",
        google: "$google",
        creator: "$creator",
        members: "$members",
        subscriptionId: "$subscriptionId"
    }},
    {
        $merge: {
          into: "users",
          on: "_id",
          whenMatched: "replace",
          whenNotMatched: "discard"
        }
    }
]);

