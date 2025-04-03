// Select the database to use.
use('wufwuf-automations');

// Update all individual users' onboardingStatus to "discover"
db.getCollection('users').updateMany(
    {
        type: 'individual'  // only target individual users, not workspaces
    },
    {
        $set: {
            onboardingStatus: 'discover'
        }
    }
);

// To verify the changes, you can run this aggregation:
db.getCollection('users').aggregate([
    {
        $match: {
            type: 'individual'
        }
    },
    {
        $group: {
            _id: '$onboardingStatus',
            count: { $sum: 1 },
            users: { $push: { id: '$_id', name: '$name', status: '$onboardingStatus' } }
        }
    }
]);