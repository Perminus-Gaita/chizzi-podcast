import { ObjectId } from "mongodb";

export const editImageTitle = async (db, imageId, newTitle) => {
  try {
    const imagesCollection = db.collection("images");

    // If the video was not found, try to update an image
    const updatedImage = await imagesCollection.findOneAndUpdate(
      { _id: new ObjectId(imageId) },
      { $set: { title: newTitle } },
      { returnOriginal: false }
    );

    if (updatedImage.value) {
      return updatedImage.value;
    }

    // If neither a video nor an image was found with the specified ID
    return null;
  } catch (error) {
    console.log("An error occurred while updating image title.");
    console.log(error);
    throw error;
  }
};

export const editVideoTitle = async (db, videoId, newTitle) => {
  try {
    const videosCollection = db.collection("videos");

    // If the video was not found, try to update an image
    const updatedVideo = await videosCollection.findOneAndUpdate(
      { _id: new ObjectId(videoId) },
      { $set: { title: newTitle } },
      { returnOriginal: false }
    );

    if (updatedVideo.value) {
      return updatedVideo.value;
    }

    return null;
  } catch (error) {
    console.log("An error occurred while updating video title.");
    console.log(error);
    throw error;
  }
};
