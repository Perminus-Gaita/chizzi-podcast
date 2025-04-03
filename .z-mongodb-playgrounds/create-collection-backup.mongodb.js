// backup the wallets first
const collectionName = "put colletion name here";
const backupName = `${collectionName}_backup_${new Date().toISOString()}`;
db.getCollection(collectionName).aggregate([{ $out: backupName }]);

