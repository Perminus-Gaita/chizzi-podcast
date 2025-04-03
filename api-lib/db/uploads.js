import imageModel from "@/models/image.model";
import videoModel from "@/models/video.model";
import { ObjectId } from "mongodb";

export const save_metadata = async (
  db,
  creator,
  title,
  description,
  tags,
  filename,
  selected_platforms,
  upload_status,
  scheduled_date,
  aws_url,
  random_number
) => {
  console.log("Saving Metadata...");
  try {
    const upload = {
      creator,
      title,
      description,
      tags,
      filename,
      selected_platforms,
      upload_status,
      scheduled_date,
      aws_url,
      random_number,
      createdAt: new Date(),
    };

    const result = await db.collection("uploads").insertOne(upload);
    const saved_upload = { ...upload, _id: result.insertedId };

    console.log(saved_upload);

    return saved_upload;
  } catch (error) {
    console.log("An error occurred");
    console.log(error);
    return error;
  }
};

export const getUploadsByWorkspaceId = async (workspaceId) => {
  const videos = await videoModel
    .find({
      workspaceId: new ObjectId(workspaceId),
    })
    .sort({ createdAt: -1 })
    .exec();

  const images = await imageModel
    .find({
      workspaceId: new ObjectId(workspaceId),
    })
    .sort({ createdAt: -1 })
    .exec();

  return { videos, images };
};

// export const getUploadsById = async (db, uuid) => {
//   console.log("Fetching uploads by user id:", uuid);

//   try {
//     const videos = await db
//       .collection("videos")
//       .find({ userId: new ObjectId(uuid) })
//       .sort({ createdAt: -1 })
//       .toArray();

//     const images = await db
//       .collection("images")
//       .find({ userId: new ObjectId(uuid) })
//       .sort({ createdAt: -1 })
//       .toArray();

//     console.log("### Found videos ==>");
//     console.log(videos);

//     console.log("### Found images ==>");
//     console.log(images);

//     return { videos, images };
//   } catch (error) {
//     console.log("An error occurred while fetching uploads.");
//     console.log(error);
//     return error;
//   }
// };
