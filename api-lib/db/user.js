import { ObjectId } from "mongodb";

export async function getYoutubeData(db, uuid) {
  return db
    .collection("users")
    .findOne({ _id: ObjectId(uuid) })
    .then((user) => (user ? user.youtubeSocial : null));
}

export async function getAccessTokenById(db, uuid) {
  return db
    .collection("users")
    .findOne({ _id: ObjectId(uuid) })
    .then((user) => (user ? user.youtube.accessToken : null));
}

export async function find_user_by_username(db, username) {
  return db
    .collection("users")
    .findOne({ username })
    .then((user) => user || null);
}

export async function update_user_by_id(db, id, username, profile_picture) {
  return db
    .collection("users")
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          username: username,
          profilePicture: profile_picture,
        },
      },
      { returnDocument: "after" }
    )
    .then(({ value }) => value);
}
