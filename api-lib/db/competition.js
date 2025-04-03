import { ObjectId } from "mongodb";
// import { competitionLookupAggregation } from "../../services/mongodb_aggregations/competitions.aggregations";

// export const find_competition_by_id = async (db, competition_id) => {
//   const competition = await db
//     .collection("competitions")
//     .aggregate([
//       { $match: { _id: new ObjectId(competition_id) } },
//       ...competitionLookupAggregation(),
//       { $sort: { createdAt: -1 } },
//     ])
//     .toArray();

//   if (!competition[0]) return null;

//   return competition[0];
// };

export const get_ticket = async (db, user_id, competition_id) => {
  const existing_ticket = await db
    .collection("tickets")
    .findOne({ userId: user_id });

  if (existing_ticket) {
    return;
  } else {
    const new_ticket = {
      competitionId: competition_id,
      userId: user_id,
      createdAt: new Date(),
    };

    const { inserted_id } = await db
      .collection("tickets")
      .insertOne(new_ticket);

    new_ticket._id = inserted_id;

    console.log("Ticket ID");
    console.log(inserted_id);

    return new_ticket;
  }
};
