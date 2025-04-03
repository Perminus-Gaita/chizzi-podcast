import { ObjectId } from "mongodb";

export const create_room = async (db, room_name, creator) => {
  const new_room = {
    roomName: room_name,
    creator: creator,
    players: [creator],
    createdAt: new Date(),
  };

  const { insertedId } = await db
    .collection("rooms")
    .insertOne(new_room, { unique: true });

  new_room._id = insertedId;

  console.log("Room ID");
  console.log(insertedId);

  return new_room;
};

export const get_room_data = async (db, room_id) => {
  const room_data = await db
    .collection("rooms")
    .findOne({ _id: new ObjectId(room_id) })
    .then((room_data) => room_data || null);

  // console.log("DI DATA");

  // console.log(room_data);

  return JSON.stringify(room_data);
};

export const add_player = async (db, room_id, user_id) => {
  const room = await db
    .collection("rooms")
    .findOne({ _id: new ObjectId(room_id) });

  let players = room.players;

  // if (room.players.length < 2 && room.players.includes(user_id) === false) {
  //   room.players = [...room.players, user_id];
  // }
  if (players.length == 1 && players.includes(user_id) === false) {
    const updated_room = await db.collection("rooms").findOneAndUpdate(
      { _id: new ObjectId(room_id) },
      {
        $set: {
          players: [...players, user_id],
        },
      },
      { returnNewDocument: true }
    );

    return updated_room.value;
  }

  return room;

  // const players = room.players;

  // return;
};

export const remove_player = async (db, room_id) => {
  return;
};

// db.collection.updateMany(
//   { length: { $lte: 2 } },
//   { $set: { status: "short" } }
// );
