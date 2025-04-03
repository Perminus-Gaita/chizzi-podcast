import { Suspense } from "react";
import {
  TournamentModel,
  MatchModel,
  ParticipantModel,
} from "@/models/tournament.model";
import userModel from "@/models/user/index.model";
import database_connection from "@/services/database";
import UserTournament from "./client";

database_connection().then(() =>
  console.log("Connected successfully (tournament configs)")
);

export const generateMetadata = async (props) => {
  const params = await props.params;
  const { tournamentName, username } = params;

  return {
    title: `${tournamentName} tournament | wufwuf`,
    description: `Join the ${tournamentName} tournament on Wufwuf and compete against other players. Win exciting prizes and bragging rights!`,
    keywords: [
      "tournament",
      "kadi",
      "gaming",
      "Wufwuf",
      "online gaming",
      "competitive gaming",
    ],
    openGraph: {
      title: `${tournamentName} Tournament | Wufwuf`,
      description: `Join the ${tournamentName} tournament on Wufwuf and compete against other players. Win exciting prizes and bragging rights!`,
      image: `https://www.wufwuf.io/public/tournament_config_image_${tournamentName}.jpg`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${tournamentName} Tournament | Wufwuf`,
      description: `Join the ${tournamentName} tournament on Wufwuf and compete against other players. Win exciting prizes and bragging rights!`,
    },
  };
};

const getTournamentData = async (slug) => {
  const [tournament] = await TournamentModel.aggregate([
    { $match: { slug } },
    {
      $lookup: {
        from: "users",
        localField: "creator",
        foreignField: "_id",
        as: "creator",
      },
    },
    { $unwind: "$creator" },
    {
      $lookup: {
        from: "sponsorships",
        let: { tournamentId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$tournamentId", "$$tournamentId"] },
              // status: "success",
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "sponsorId",
              foreignField: "_id",
              as: "sponsor",
            },
          },
          { $unwind: "$sponsor" },
          {
            $project: {
              amount: 1,
              createdAt: 1,
              "sponsor.username": 1,
              "sponsor.profilePicture": 1,
              "sponsor.name": 1,
              status: 1,
              type: 1,
              paymentMethod: 1,
              mpesaTransactionCode: {
                $cond: {
                  if: { $eq: ["$paymentMethod", "userManagedMpesa"] },
                  then: "$mpesaTransactionCode",
                  else: null,
                },
              },
            },
          },
        ],
        as: "sponsors",
      },
    },
    {
      $lookup: {
        from: "matches",
        let: {
          tournamentId: "$_id",
          telegramGroupId: "$telegramGroupId",
        },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$tournamentId", "$$tournamentId"] },
            },
          },
          {
            $lookup: {
              from: "participants",
              localField: "participants",
              foreignField: "_id",
              as: "participants",
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "participants.userId",
              foreignField: "_id",
              as: "participantUsers",
            },
          },
          {
            $lookup: {
              from: "cardsrooms",
              localField: "gameRoom",
              foreignField: "_id",
              as: "gameRoomDetails",
            },
          },
          {
            $unwind: {
              path: "$gameRoomDetails",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $addFields: {
              participants: {
                $map: {
                  input: "$participants",
                  as: "participant",
                  in: {
                    participantId: "$$participant._id",
                    userId: "$$participant.userId",
                    resultText: "$$participant.resultText",
                    isWinner: "$$participant.isWinner",
                    buyInDetails: "$$participant.buyInDetails",
                    checkedIn: {
                      $cond: {
                        if: {
                          $eq: [
                            { $ifNull: ["$gameRoomDetails.players", []] },
                            [],
                          ],
                        },
                        then: false,
                        else: {
                          $gt: [
                            {
                              $size: {
                                $filter: {
                                  input: {
                                    $ifNull: ["$gameRoomDetails.players", []],
                                  },
                                  cond: {
                                    $and: [
                                      {
                                        $eq: [
                                          "$$this.player",
                                          "$$participant.userId",
                                        ],
                                      },
                                      { $eq: ["$$this.checkedIn", true] },
                                    ],
                                  },
                                },
                              },
                            },
                            0,
                          ],
                        },
                      },
                    },
                    user: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$participantUsers",
                            cond: {
                              $eq: ["$$this._id", "$$participant.userId"],
                            },
                          },
                        },
                        0,
                      ],
                    },
                    telegramGroupId: "$$telegramGroupId",
                  },
                },
              },
            },
          },
          {
            $project: {
              id: 1,
              name: 1,
              nextMatchId: 1,
              tournamentRoundText: 1,
              state: 1,
              startTime: 1,
              gameRoom: 1,
              gameRoomDetails: {
                name: 1,
                gameStatus: 1,
                maxPlayers: 1,
                timer: 1,
                pot: 1,
                winner: 1,
              },
              participants: {
                $map: {
                  input: "$participants",
                  as: "p",
                  in: {
                    participantId: "$$p.participantId",
                    userId: "$$p.userId",
                    resultText: "$$p.resultText",
                    isWinner: "$$p.isWinner",
                    buyInDetails: "$$p.buyInDetails",
                    checkedIn: "$$p.checkedIn",
                    name: "$$p.user.name",
                    username: "$$p.user.username",
                    profilePicture: "$$p.user.profilePicture",
                    telegramUserId: "$$p.user.telegram.userId",
                    telegramGroupId: "$$p.telegramGroupId",
                  },
                },
              },
            },
          },
        ],
        as: "matches",
      },
    },
    {
      $lookup: {
        from: "participants",
        let: { tournamentId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$tournamentId", "$$tournamentId"] },
            },
          },
          {
            $group: {
              _id: "$userId",
            },
          },
        ],
        as: "uniqueParticipants",
      },
    },
    {
      $addFields: {
        currentParticipants: { $size: "$uniqueParticipants" },
      },
    },
    {
      $lookup: {
        from: "telegramgroups",
        let: { groupId: "$telegramGroupId" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$telegramGroupId", "$$groupId"] },
            },
          },
          {
            $project: {
              name: "$groupName",
              memberCount: 1,
              type: "$groupType",
              botRole: "$wufwufBotRole",
              inviteLink: "$primaryInviteLink",
              botPermissions: 1,
            },
          },
        ],
        as: "telegramGroup",
      },
    },
    {
      $addFields: {
        telegramGroup: { $arrayElemAt: ["$telegramGroup", 0] },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        telegramGroupId: 1,
        slug: 1,
        description: 1,
        paymentInformation: 1,
        requireTelegram: 1,
        game: 1,
        format: 1,
        autoStart: 1,
        type: 1,
        status: 1,
        numberOfParticipants: 1,
        currentParticipants: 1,
        buyIn: 1,
        prizeDistribution: 1,
        sponsorshipDetails: 1,
        matches: 1,
        sponsors: 1,
        sponsorCount: { $size: "$sponsors" },
        totalSponsorship: { $sum: "$sponsors.amount" },
        telegramGroup: 1,
        "creator._id": 1,
        "creator.name": 1,
        "creator.username": 1,
        "creator.profilePicture": 1,
        customBannerImage: 1,
        customTableBackgroundImage: 1,
        customCardSkinImage: 1,
        brandingLogo: 1,
        createdAt: 1,
      },
    },
  ]);

  return tournament || {};
};

const serializeData = (data) => {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
};

const TournamentPage = async (props) => {
  const params = await props.params;
  const { tournamentName, username } = params;

  const tournament = await getTournamentData(tournamentName);
  // console.log({ tournament: JSON.stringify(tournament, null, 2) });

  const serializedTournament = serializeData(tournament);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserTournament tournament={serializedTournament} creator={username} />
    </Suspense>
  );
};

export default TournamentPage;
