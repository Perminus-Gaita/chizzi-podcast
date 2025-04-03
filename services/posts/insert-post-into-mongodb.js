/**Facebook Posts */
import FacebookTextPost from '@/models/post/facebook/text.model';
import FacebookReelPost from '@/models/post/facebook/reel.model';
import FacebookImagePost from '@/models/post/facebook/image.model';
import FacebookImageStoryPost from '@/models/post/facebook/image-story.model';
import FacebookVideoPost from '@/models/post/facebook/video.model';
import FacebookVideoStoryPost from '@/models/post/facebook/video-story.model';
/**Instagram Posts */
import InstagramPost from '@/models/post/instagram/post.model';
/**Tiktok Posts */
import TiktokImagePost from '@/models/post/tiktok/image.model';
import TiktokVideoPost from '@/models/post/tiktok/video.model';
/**Youtube Posts */
import YoutubeShortPost from '@/models/post/youtube/short.model';


// Connect to the database **Outside of handler function**
import connectToDatabaseMongoDB from '@/lib/database';
await connectToDatabaseMongoDB("insertPostsIntoMongoDB")

// Function to handle inserting a post into the database
export async function insertPostIntoMongoDB(postToInsert){
  if (postToInsert.platform == "facebook") {
    const insertedFacebookPost = await insertFacebookPost(postToInsert);
    return insertedFacebookPost;
  } else if (postToInsert.platform == "instagram") {
    const insertedInstagramPost = await insertInstagramPost(postToInsert);
    return insertedInstagramPost;
  } else if (postToInsert.platform == "youtube") {
    const insertedYoutubePost = await insertYoutubePost(postToInsert);
    return insertedYoutubePost;
  } else if (postToInsert.platform == "tiktok") {
    const insertedTiktokPost = await insertTiktokPost(postToInsert);
    return insertedTiktokPost;
  } else {
    throw new Error("Incorrect post data format.");
  }
}

// insert facebook posts
async function insertFacebookPost(postToInsert) {
  try {
    if (postToInsert.platform == "facebook" && postToInsert.type == "reel") {
      const insertedFacebookReelPost = await FacebookReelPost.create(postToInsert);
      return insertedFacebookReelPost;
    } else if (postToInsert.platform == "facebook" && postToInsert.type == "image") {
      const insertedFacebookImagePost = await FacebookImagePost.create(postToInsert);
      return insertedFacebookImagePost;
    } else if (postToInsert.platform == "facebook" && postToInsert.type == "imageStory") {
      const insertedFacebookImageStoryPost = await FacebookImageStoryPost.create(postToInsert);
      return insertedFacebookImageStoryPost;
    } else if (postToInsert.platform == "facebook" && postToInsert.type == "text") {
      const insertedFacebookTextPost = await FacebookTextPost.create(postToInsert);
      return insertedFacebookTextPost; 
    } else if (postToInsert.platform == "facebook" && postToInsert.type == "videoStory") {
      const insertedFacebookVideoStoryPost = await FacebookVideoStoryPost.create(postToInsert);
      return insertedFacebookVideoStoryPost;
    } else if (postToInsert.platform == "facebook" && postToInsert.type == "video") {
      const insertedFacebookVideoPost = await FacebookVideoPost.create(postToInsert);
      return insertedFacebookVideoPost;
    } else {
      throw new Error("Incorrect post data format");
    }
  } catch (error) {
    console.log("error inserting facebook post", error)
    throw error;
  }
}
    
// insert instagram post
async function insertInstagramPost(postToInsert) {
  try { // Instagram posts (handles all kinds of Instagram posts)
    if (postToInsert.platform == "instagram") {
      const insertedInstagramPost = await InstagramPost.create(postToInsert);
      console.log({ insertedInstagramPost });
      return insertedInstagramPost;
    } else {
      throw new Error("Incorrect post data format");
    }
  } catch (error) {
    console.log("error inserting instagram post", error)
    throw error;
  }
}
    
// insert tiktok post
async function insertTiktokPost(postToInsert) {
  try {
    if (postToInsert.platform == "tiktok" && postToInsert.type == "video") {
      const insertedTiktokVideoPost = await TiktokVideoPost.create(postToInsert);
      return insertedTiktokVideoPost;
    } else if (postToInsert.platform == "tiktok" && postToInsert.type == "image") {
      const insertedTiktokImagePost = await TiktokImagePost.create(postToInsert);
      return insertedTiktokImagePost;
    } else {
      throw new Error("Incorrect post data format");
    }
  } catch (error) {
    console.log("error inserting tiktok post", error)
    throw error;
  }
}
    
// insert youtube post
async function insertYoutubePost(postToInsert) {
  try {
    if (postToInsert.platform == "youtube" && postToInsert.type == "short") {
      const insertedYoutubeShortPost = await YoutubeShortPost.create(postToInsert);
      console.log({ insertedYoutubeShortPost });
      return insertedYoutubeShortPost;
    } else {
      throw new Error("Incorrect post data format");
    }
  } catch (error) {
    console.log("error inserting youtube post", error)
    throw error;
  }
}



