import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import mongoose from 'mongoose';

import User from "@/models/user/index.model";
import CustomError from '@/api-lib/error-handling/custom-error';

// Connect to the database **Outside of handler function**
import connectToDatabaseMongoDB from '@/lib/database';

// Connect to dynamoDB where session data is stored
const client = new DynamoDBClient({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});
const docClient = DynamoDBDocumentClient.from(client);

export async function getUserSession(cookies, throwErrorIfNull=false) {
  // connect to database inside the funtions nextjs
  await connectToDatabaseMongoDB("getUserSession");

  const sessionId = await getCookieValueByName(cookies, "sessionId");
  if(throwErrorIfNull){
    if(!sessionId){
        throw new CustomError("No User Session Available", 401);
    };
  } else {
    if(!sessionId){ return null; };
  }

  const command = new GetCommand({
    TableName: "UserSessions",
    Key: { sessionId },
  });

  const response = await docClient.send(command);
  const sessionData = response.Item;
  
  // if not session data return null
  if(!sessionData){ return null; };
  
  const userIdFromSessionData = sessionData?.userId;

  const userFromMongoDB = await getSessionUser(
    userIdFromSessionData
  );

  // console.log({userFromMongoDB})
  return userFromMongoDB;
  
}

// Get cookie value by name
async function getCookieValueByName(cookies, name){
    const cookieStore = await cookies()
    const parsedCookies = cookieStore._parsed;

    const v = parsedCookies.get(name);

    return v?.value;
}

// Get session user data.
async function getSessionUser(userId){
  const sessionUserInArray = await User.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: 'users',
        let: { userId: '$_id', currentWorkspaceId: '$currentWorkspaceId' },
        pipeline: [
          { $match:
            { $expr:
              { $cond: [
                { $or: [
                  { $eq: [{ $ifNull: ['$members', []] }, []] },
                  { $eq: [{ $size: { $ifNull: ['$members', []] } }, 0] }
                ]},
                false,
                { $in: ['$$userId', { $ifNull: ['$members.userId', []] }] }
              ]}
            }
          },
          { $project:{
            name: 1,
            username: 1,
            profilePicture: 1,
            // creator: 1,
            // members: 1,
            isCurrentUserTheCreatorOfThisWorkspace: { 
              $eq: [ "$creator", "$$userId" ] 
            }, 
            currentUserRole: {
              $getField: {
                field: "role",
                input: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$members",
                        as: "member",
                        cond: { $eq: ["$$member.userId", "$$userId"] }
                      }
                    },
                    0
                  ]
                }
              }
            },
            currentSubscription: 1,
            isCurrentWorkspace: { $eq: ["$_id", "$$currentWorkspaceId"] }
          }},
          {
            $lookup: {
              from: 'subscriptions',
              let: { subscriptionId: '$currentSubscription' },
              pipeline: [
                { $match: {
                  $expr: { $eq: ['$_id', '$$subscriptionId'] }
                }},
                {
                  $lookup: {
                    from: 'plans',
                    localField: 'planId',
                    foreignField: '_id',
                    as: 'plan'
                  }
                },
                { $unwind: '$plan' },
                { $project: {
                  status: 1,
                  startDate: 1,
                  endDate: 1,
                  nextPaymentDate: 1,
                  isInitialSubscription: 1,
                  plan: {
                    _id: "$planId",
                    name: 1,
                    interval: 1,
                    isTrial: 1
                  },
                }},
              ],
              as: 'currentSubscription'
            }
          },
          { $unwind: { path: '$currentSubscription', preserveNullAndEmptyArrays: true } }
        ],
        as: 'workspaces'
      }
    },
    {
      $project: {
        _id: 1,
        name: 1,
        username: 1,
        type: 1,
        currentWorkspaceId: 1,
        onboardingStatus: 1,
        accountType: 1,
        discovery: 1,
        profilePicture: 1,
        mainEmail: 1,
        providers: 1,
        workspaces: 1,
        google: {
          userId: 1,
          name: 1,
          email: 1,
          profilePicture: 1
        },
        telegram: { 
          userId: 1,
          firstName: 1,
          lastName: 1,
          username: 1,
          profilePicture: 1,
          authorizationDate: 1,
        },
        currentWorkspace: {
          $arrayElemAt: [
            {
              $filter: {
                input: "$workspaces",
                as: "workspace",
                cond: { $eq: ["$$workspace.isCurrentWorkspace", true] }
              }
            },
            0
          ]
        }
      }
    }
  ]);

  const sessionUser = sessionUserInArray[0]
  return sessionUser;
}

