/* global use, db */
// MongoDB Playground
// Verify existing indexes in the products collection

// The current database to use.
use('wufwuf-automations');

// Check all indexes on the products collection
db.getCollection('products').dropIndex('initialOwner_1_groupName_1');
db.getCollection('products').dropIndex('groupName_1_name_1');
