use('wufwuf-automations-test');

db.getCollection('paymentdetails').aggregate([
  {
    $match: {
      // $or: [
      //   { userId: ObjectId("YOUR_USER_ID") },
      //   { workspaceId: ObjectId("YOUR_WORKSPACE_ID") }
      // ],
      type: "authorization",
      "authorization.signature": { $ne: null } //Ignore documents where signature is null
    }
  },
  {
    $sort: { createdAt: -1 } // Sort by latest createdAt
  },
  {
    $group: {
      _id: "$authorization.signature", // Group by signature
      latestPayment: { $first: "$$ROOT" } // Pick the latest document per signature
    }
  },
  {
    $replaceRoot: { newRoot: "$latestPayment" } // Flatten the structure
  }
]);

