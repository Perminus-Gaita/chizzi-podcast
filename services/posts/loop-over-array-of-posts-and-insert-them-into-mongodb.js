import { getImageOrVideoObjectIds } from '@/services/posts/get-image-or-video-object-ids';
import { insertPostIntoMongoDB } from '@/services/posts/insert-post-into-mongodb';
import { putEventsToEventBridge } from '@/services/event-bridge/put-events-to-event-bridge';

// Function to handle inserting a post into the database
export async function loopOverArrayOfPostsAndInsertThemIntoMongoDB(arrayOfPostsToInsert) {
    const insertedPosts = await Promise.all(arrayOfPostsToInsert.map(async postToInsert => {
        if (('s3ObjectKey' in postToInsert) || ('arrayOfS3ObjectKeys' in postToInsert)) {
            const post = await getImageOrVideoObjectIds(postToInsert);
            const insertedPost = await insertPostIntoMongoDB(post);
            await sendPostInsertedIntoDatabaseEventToEventBridge(insertedPost)
            return insertedPost;
        } else {
            const insertedPost = await insertPostIntoMongoDB(postToInsert);
            await sendPostInsertedIntoDatabaseEventToEventBridge(insertedPost)
            return insertedPost;
        }
    }));

    return insertedPosts;
}

// emit event to eventbridge for futher processing
async function sendPostInsertedIntoDatabaseEventToEventBridge(insertedPost){
    const result = await putEventsToEventBridge({
        Entries: [{
            Detail: {
                "insertedPost": insertedPost
            },
            DetailType: "postInsertedIntoDatabase",
            EventBusName: "wufwuf",
            Source: "wufwufNextJS: loopOverArrayOfPostsAndInsertThemIntoMongoDB"
        }]
    });
    return result;
}
