import userModel from "@/models/user/index.model";
import channelDataModel from "../../models/youtube.model";

export const saveChannelData = async (
  uuid,
  channelData,
  channelMetadata,
  viewsData,
  watchTimeData,
  engagementData,
  retentionData
) => {
  console.log("Saving Channel Metadata...");

  const user = await userModel.findById(uuid).exec(); // Assuming you have a User model/schema defined

  if (!user) {
    throw new Error("User not found");
  }

  const { viewCount, subscriberCount, hiddenSubscriberCount, videoCount } =
    channelData;

  const { channelId, description, thumbnails, title } = channelMetadata;

  try {
    const filter = { uuid: user._id };
    const update = {
      channelId,
      title,
      description,
      thumbnails,
      viewCount,
      subscriberCount,
      hiddenSubscriberCount,
      videoCount,
      viewsData,
      watchTimeData,
      engagementData,
      retentionData,
    };

    const options = { upsert: true, new: true };

    const updatedChannelData = await channelDataModel.findOneAndUpdate(
      filter,
      update,
      options
    );

    console.log("ChannelData stored/updated successfully");
    console.log(updatedChannelData);

    return updatedChannelData;
  } catch (error) {
    console.log("An error occurred during saving data");
    console.log(error);
    return error;
  }
};

// export const getChannelData = async (db, uuid) => {
//   console.log("Fetching uploads by user id:", uuid);

//   try {
//     const uploads = await db
//       .collection("videos")
//       .find({ userId: new ObjectId(uuid) })
//       .toArray();

//     console.log(uploads);

//     return uploads;
//   } catch (error) {
//     console.log("An error occurred while fetching uploads.");
//     console.log(error);
//     return error;
//   }
// };
