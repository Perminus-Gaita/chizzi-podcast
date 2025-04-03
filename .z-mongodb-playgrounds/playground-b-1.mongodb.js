/* global use, db */
// MongoDB Playground
// Verify existing indexes in the products collection

// The current database to use.
use('wufwuf-automations');

// Check all indexes on the products collection
const productIndexes = db.getCollection('products').getIndexes();
print('Product Collection Indexes:');
printjson(productIndexes);

// Look specifically for the compound index
const compoundIndexes = productIndexes.filter(index => 
  index.key && index.key.initialOwner && index.key.groupName
);
print('\nCompound Indexes with initialOwner and groupName:');
printjson(compoundIndexes);

// Check if there are products that would violate the compound index
// Group products by initialOwner and groupName, and check if any group has multiple entries
const duplicateGroups = db.getCollection('products').aggregate([
  {
    $group: {
      _id: { initialOwner: "$initialOwner", groupName: "$groupName" },
      count: { $sum: 1 },
      names: { $push: "$name" },
      ids: { $push: "$_id" }
    }
  },
  {
    $match: { count: { $gt: 1 } }
  },
  {
    $sort: { count: -1 }
  }
]);

print('\nGroups with multiple products (potential index violations):');
printjson(duplicateGroups.toArray());

// Search for a specific product by groupName to analyze
print('\nSample product with groupName "Fgghjhhjhgghvbgv":');
const sampleProduct = db.getCollection('products').findOne({ 
  groupName: "Fgghjhhjhgghvbgv" 
});
printjson(sampleProduct);

// Count total products with the problematic groupName
const totalWithGroupName = db.getCollection('products').count({ 
  groupName: "Fgghjhhjhgghvbgv" 
});
print(`\nTotal products with groupName "Fgghjhhjhgghvbgv": ${totalWithGroupName}`);

// If you know the specific initialOwner ID causing the error
const ownerIdFromError = '65e80bead9220bb088327df1';
print('\nProducts with the same initialOwner and groupName from error:');
const conflictingProducts = db.getCollection('products').find({ 
  initialOwner: { $eq: new ObjectId(ownerIdFromError) },
  groupName: "Fgghjhhjhgghvbgv"
}).toArray();
printjson(conflictingProducts);


