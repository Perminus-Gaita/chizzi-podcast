/* global use, db */
// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use('wufwuf-automations');

// Create a new document in the collection.
db.getCollection('telegramgroups').insertOne({
  _id: ObjectId(), // Generating a new ObjectId
  telegramGroupId: '-4785324695',
  __v: 0,
  allMembersAreAdministrators: true, // From your data: "all_members_are_administrators": true
  botPermissions: {
    canInviteViaLink: true,
    canManageStories: false
  },
  createdAt: ISODate(new Date().toISOString()),
  groupName: 'Riccobeatz Tournaments', // From your data: "title": "Riccobeatz Tournaments"
  groupType: 'group', // From your data: "type": "group"
  hasSentFinalBotStatusMessage: false,
  memberCount: 1, // Assuming at least one member (could be adjusted)
  telegramUserId: '2073180694', // From "from": { "id": 2073180694 }
  updatedAt: ISODate(new Date().toISOString()),
  wufwufBotRole: 'administrator' // From new_chat_member status
});