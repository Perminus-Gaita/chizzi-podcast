import Video from '@/models/video.model.js';
import Image from '@/models/image.model.js';

// Connect to the database **Outside of handler function**
import connectToDatabaseMongoDB from '@/lib/database';
await connectToDatabaseMongoDB("getImageOrVideoObjectIds")


// get-image-or-video-object-ids
export async function getImageOrVideoObjectIds(postObject) {
  try {
    if (postObject.type === 'image' || postObject.type === 'imageStory') {
      if('arrayOfS3ObjectKeys' in postObject){
        //check if the field arrayOfS3ObjectKeys is present in postObject
        if (!postObject.arrayOfS3ObjectKeys || !Array.isArray(postObject.arrayOfS3ObjectKeys)) {
          throw new Error('arrayOfS3ObjectKeys is missing or not an array');
        }
      
        const unfilteredImageIds = await Promise.all(postObject.arrayOfS3ObjectKeys.map(async (s3ObjectKey) => {
          const image = await Image.findOne({ s3ObjectKey }).exec();
          return image ? image._id : null;
        }));
      
        const imageIds = unfilteredImageIds.filter(id => id !== null);

        // Remove the "arrayOfS3ObjectKeys" property from the postObject object
        delete postObject.arrayOfS3ObjectKeys;

        return {
          ...postObject,
          imageIds,
        };
      } else {
        const image = await Image.findOne({ s3ObjectKey: postObject.s3ObjectKey }).exec();
        if (image === null) {
          throw new Error('No image with the given s3ObjectKey found in the database');
        }
        const imageId = image._id;

        // Remove the "s3ObjectKey" property from the postObject object
        delete postObject.s3ObjectKey;

        return {
          ...postObject,
          imageId,
        };
      }
    } else {
      const video = await Video.findOne({ s3ObjectKey: postObject.s3ObjectKey }).exec();
      if (video === null) {
        throw new Error('No video with the given s3ObjectKey found in the database');
      }
      const videoId = video._id;

      // Remove the "s3ObjectKey" property from the postObject object
      delete postObject.s3ObjectKey;

      return {
        ...postObject,
        videoId,
      };
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
