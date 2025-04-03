use('wufwuf-automations-test');

db.users.aggregate([
    {
      $match: {
        type: "individual",
      }
    }
]);
