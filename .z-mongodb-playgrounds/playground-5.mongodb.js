// Define the competition data
const competitionData = {
    _id: ObjectId("67dc26b7f72f82ef9e505dc6"),
    name: "Riccobeatz 808 Challenge 1",
    creatorId: ObjectId("668269d7271fb5b5577e27ca"), // Convert string to ObjectId
    status: "submissions",
    startDate: new Date("2024-03-21"), // Convert string to Date object
    endDate: new Date("2024-03-28"), // Convert string to Date object
    prize: "Premium Riccobeatz beat",
    sponsors: [], // Empty array for sponsors (can be populated later)
    participants: [], // Empty array for participants (can be populated later)
};

// Select the database to use (assuming MongoDB connection is already established)
use('wufwuf-automations');

// Define the filter, update, and options for the MongoDB operation
const filter = { 
    name: competitionData.name, // Filter by competition name
    creatorId: competitionData.creatorId // Filter by creator ID
};
const update = {
    $set: {
        _id: competitionData._id,
        name: competitionData.name,
        creatorId: competitionData.creatorId,
        status: competitionData.status,
        startDate: competitionData.startDate,
        endDate: competitionData.endDate,
        prize: competitionData.prize,
        sponsors: competitionData.sponsors,
        participants: competitionData.participants,
    }
};
const options = {
    new: true, // Return the modified document rather than the original
    upsert: true, // Create a new document if no document matches the filter
    runValidators: true, // Run schema validators on update
    setDefaultsOnInsert: true // Set default values on insert
};

// Insert or update the competition document in the 'competitions' collection
db.getCollection('competitions').findOneAndUpdate(
    filter, update, options
);