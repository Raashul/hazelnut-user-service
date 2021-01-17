'use strict';

const logger = require(__base + '/app/modules/common/logger');
const postGeneration = require(__base + '/app/modules/secondary_service/postGeneration');


//check if more buckets exists
//randomly pick one bucket
//inside the bucket, randomly pick a post
//get post information
// with user_id, get the email information of the user
// store all information in reminders table
module.exports.generatePosts = (request_id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let new_body = data;
      let bucket_id = '';
      let child_buckets = [];

      await postGeneration.validation(request_id, new_body);

      const is_parent = await postGeneration.checkIfParentBucket(request_id, new_body);

      if (is_parent) {
        //create a child buckets array to keep track of buckets that are visited
        child_buckets = await postGeneration.getChildBuckets(request_id, new_body);
        //pick a random bucket
        bucket_id = await postGeneration.pickRandomBucket(request_id, new_body);
        new_body.random_bucket_id_selected = bucket_id;
      } else {
        new_body.random_bucket_id_selected = new_body.bucket_id;
      }

      let isPost = await postGeneration.checkIfPostExistInsideBucket(request_id,new_body);
      if (!isPost && !is_parent) {
        reject({code: 103.1, custom_message: 'No post inside bucket to generate reminder'});
      }

      while (child_buckets.length > 0 && !isPost) {
        bucket_id = pickRandomFromBucketArr(child_buckets);
        // bucket_id = await postGeneration.pickRandomBucket(request_id, new_body);
        new_body.random_bucket_id_selected = bucket_id;
        
        isPost = await postGeneration.checkIfPostExistInsideBucket(request_id,new_body);

        if(!isPost) {
          child_buckets = child_buckets.filter(bucket => bucket.bucket_id !== bucket_id)
        }
      }

      if(child_buckets.length === 0 && !isPost) {
        logger.warn('No posts inside bucket to send reminders');
        reject({code: 103.1, custom_message: 'No post inside parent bucket to generate reminder'});
      }

      const post = await postGeneration.pickRandomPost(request_id, new_body);
      new_body.post_id = post.post_id;
      // new_body.post_content = post.content;

      const email = await postGeneration.getUserInformation(request_id,new_body);
      
      new_body.email = email;

      resolve(new_body);
    } catch (e) {
      reject({ code: 103, message: { message: e.message, stack: e.stack } });
    }
  });
};


function pickRandomFromBucketArr(bucketArr) {
  const bucket = bucketArr[Math.floor(Math.random() * bucketArr.length)];
  return bucket.bucket_id;
}