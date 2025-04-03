import database_connection from "@/services/database";
import cardsRoomModel from "@/models/cardsroom.model";
import CardsReplayTable from "./client";

database_connection().then(() =>
  console.log("Connected successfully [cards replay game page]")
);

export async function generateMetadata(props) {
  const params = await props.params;
  const { slug } = params;
  const room = await getRoomData(slug);

  // console.log("#ROOMY#");
  // console.log(room);
  // console.log(slug);

  return {
    title: `${room.players[0].username} vs ${room.players[1].username} - Kadi Game Replay`,
    description: `Watch an exciting Kadi match between ${room.players[0].username} and ${room.players[1].username}. See who emerges victorious in this strategic card battle!`,
  };
}

const getRoomData = async (name) => {
  try {
    const room = await cardsRoomModel.aggregate([
      { $match: { name: name, gameStatus: "gameover" } },
      {
        $lookup: {
          from: "users",
          localField: "players.player",
          foreignField: "_id",
          as: "playersWithUser",
        },
      },
      {
        $project: {
          name: 1,
          maxPlayers: 1,
          direction: 1,
          turn: 1,
          currentSuit: 1,
          discardPile: 1,
          drawPile: 1,
          players: {
            $map: {
              input: "$players",
              as: "player",
              in: {
                player: "$$player.player",
                playerDeck: "$$player.playerDeck",
                username: {
                  $arrayElemAt: [
                    "$playersWithUser.username",
                    {
                      $indexOfArray: [
                        "$playersWithUser._id",
                        "$$player.player",
                      ],
                    },
                  ],
                },
                name: {
                  $arrayElemAt: [
                    "$playersWithUser.name",
                    {
                      $indexOfArray: [
                        "$playersWithUser._id",
                        "$$player.player",
                      ],
                    },
                  ],
                },
                profilePicture: {
                  $arrayElemAt: [
                    "$playersWithUser.profilePicture",
                    {
                      $indexOfArray: [
                        "$playersWithUser._id",
                        "$$player.player",
                      ],
                    },
                  ],
                },
              },
            },
          },
          gamePlay: 1,
        },
      },
    ]);

    return room[0];
  } catch (error) {
    console.error("Error fetching room data:", error);
    return null;
  }
};

const CardsRoom = async (props) => {
  const params = await props.params;
  const { slug } = params;

  const data = await getRoomData(slug);

  // console.log("ROOM DATA ====>> ####");
  // console.log(data);

  const serializeData = (data) => {
    return JSON.parse(
      JSON.stringify(data, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );
  };

  const serializedData = serializeData(data);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      {data ? (
        <CardsReplayTable
          roomData={serializedData}
          gameData={serializedData?.gamePlay}
        />
      ) : (
        <>No data Yet!</>
      )}
    </div>
  );
};

export default CardsRoom;
