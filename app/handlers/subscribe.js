'use strict';

const response = require(__base + '/app/modules/common/response');
const logger = require(__base + '/app/modules/common/logger');
const bot = require(__base + '/app/modules/common/telegramBot');

const infoModule = require(__base + '/app/modules/subscription/info');
const addModule = require(__base + '/app/modules/subscription/add');
const deleteModule = require(__base + '/app/modules/subscription/delete');


/*
  .check if email exists
    .yes-allow subscription
    .no-signup first
  .check if bucket exists
  .check if bucket is already subscribed
  .add to subscription_buckets table
*/
module.exports.subscribeBucket = async (req, res) => {
  try {
    const body = req.body;

    await addModule.init(req.request_id, body);
    const current_user_id = await addModule.checkIfEmailExists(req.request_id, body);
    body.current_user_id = current_user_id;
    await addModule.checkIfBucketExists(req.request_id, body);
    await addModule.checkIfAlreadySubscribed(req.request_id, body);
    await addModule.addToSubscribtionTableBucket(req.request_id, body);
    bot.send(req.request_id, `Someone subscribed to a buckets ${req.request_id}`);

    response.success(req.request_id, body, res);

  } catch(e) {
    response.failure(req.request_id, e, res);
  }
}


module.exports.listSubscribedBuckets = async (req, res) => {
  try {
    const body = req.body;
    const user_id = req.authInfo.user_id;
    let response_body = req.body;
    response_body.user_id = user_id;

    await infoModule.validation(req.request_id, response_body);    
    let subscribed_buckets = await infoModule.getListOfSubscribedBuckets(req.request_id, response_body);
 
    //get count of child buckets
     Promise.all(
      subscribed_buckets.map(async (bucket) => {
        let bucket_id = bucket.bucket_id;
        const user_id = bucket.bucket_admin_user_id;
        if(bucket.template === 'bucket') {
          const count = await infoModule.numberOfChildBuckets(req.request_id, {bucket_id, user_id});
          bucket.number_of_child_buckets = count;
        } else if(bucket.template === 'post'){
          const count = await infoModule.numberOfPosts(req.request_id, {bucket_id, user_id});
          bucket.number_of_posts = count;
        }     
      })
    ).then(() => {
      response_body.subscribed_buckets = subscribed_buckets;
      response.success(req.request_id, response_body, res);
    })

  } catch(e) {
    response.failure(req.request_id, e, res);
  }
}


module.exports.listOfSubBuckets = async (req, res) => {
  try {
    const bucket_id = req.query.id;
    const user_id = req.authInfo.user_id;
    let response_body = {};
    //see if bucket is public

    const bucket_admin_user_id = await infoModule.getBucketAdminUserId(req.request_id, {bucket_id});
    
    //check if bucket is subscribed
    await infoModule.checkIfBucketIsSubscribed(req.request_id, {user_id, bucket_id})
    const buckets = await infoModule.getSecondaryBucketsIfExists(req.request_id, {user_id: bucket_admin_user_id, bucket_id})
    Promise.all(
      buckets.map(async function(bucket) { 
        let bucketId = bucket.bucket_id;

        const count = await infoModule.checkCountForBucketPost(req.request_id, {bucketId, user_id: bucket_admin_user_id});
        bucket.number_of_posts = count;

      })
    ).then(function() {
      response_body.user_id = user_id;

      response_body.subscribed_buckets = buckets;
      response.success(req.request_id, response_body, res);
    })
  } catch(e) {
    response.failure(req.request_id, e, res);
  } 
}

module.exports.unsubscribeBucket = async (req, res) => {
  try {
    const user_id = req.authInfo.user_id;
    const { bucket_id } = req.body;
    const payload = {
      user_id,
      bucket_id
    }
    await deleteModule.checkIfBucketIsSubscribed(req.request_id, payload);
    await deleteModule.removeFromSubscriptionTable(req.request_id, payload);

    response.success(req.request_id, {user_id}, res);
  } catch(e) {
    response.failure(req.request_id, e, res);
  }
}
