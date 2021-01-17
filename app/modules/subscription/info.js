'use strict';

const validator = require('validator');
const mysql = require(__base + '/app/modules/common/mysql');
const logger = require(__base + '/app/modules/common/logger');

const db = 'provisioning';


module.exports.validation = (request_id, data) => {
  return new Promise((resolve, reject) => {
    resolve();
    if(validator.isUUID(data.user_id)){
      logger.info(request_id, data.user_id);
      resolve();
    } else {
      reject({ code: 103, message: 'Attributes validation incorrect. Not UUID' });
    }
  })
}

//count number of child buckets for parent bucket
module.exports.numberOfChildBuckets = (request_id, data) => {
  return new Promise(async (resolve, reject) => {
    const query = `SELECT COUNT(*) as count FROM buckets WHERE user_id_added_by = ? AND parent_bucket_id = ? AND soft_deleted = ?;`;

    logger.info('numberOfChildBuckets', query)
    try {
      let result = await mysql.query(request_id, db, query, [data.user_id, data.bucket_id, 0]);
      if(result) {
        resolve(result[0].count);
      } else {
        reject({ code: 104, custom_message: 'No child buckets for this bucket.' })
      }
    } catch (e) {
      reject({ code: 104, message: { message: e.message, stack: e.stack } });
    }
  })
}

//count of posts inside bucket
module.exports.numberOfPosts = (request_id, data) => {
  return new Promise(async (resolve, reject) => {
    const query = `SELECT COUNT(*) as count FROM posts WHERE user_id = ? AND bucket_id = ? AND soft_deleted = ?;`;
    logger.info(query)
    try {
      let result = await mysql.query(request_id, db, query, [data.user_id, data.bucket_id, 0]);
      if(result) {
        resolve(result[0].count);
      } else {
        reject({ code: 104, custom_message: 'No more buckets for this bucket.' })
      }
    } catch (e) {
      reject({ code: 104, message: { message: e.message, stack: e.stack } });
    }
  })
}


module.exports.getListOfSubscribedBuckets = (request_id, data) => {
  return new Promise(async (resolve, reject) => {
    const query = `SELECT s.bucket_id as bucket_id, s.bucket_admin_user_id as bucket_admin_user_id, s.bucket_admin_email as bucket_admin_email,  b.bucket_name as bucket_name, b.template as template, b.type as type, b.parent_bucket_id as parent_bucket_id, b.cover_image as cover_image  FROM subscription_buckets s JOIN buckets b on s.bucket_id = b.bucket_id  WHERE s.user_id = ? AND b.soft_deleted =?`;
    try {
      let result = await mysql.query(request_id, db, query, [data.user_id, 0]);
      if(result.length >= 0) {
        resolve(result);
      } else {
        reject({ code: 103, custom_message: 'No subscribed buckets.' })
      }
    } catch (e) {
      reject({ code: 103, message: { message: e.message, stack: e.stack } });
    }
  })
}

module.exports.getBucketAdminUserId = (request_id, data) => {
  return new Promise(async (resolve, reject) => {
    const query = `SELECT user_id_added_by FROM buckets WHERE bucket_id = ? AND soft_deleted = 0;`;
    try {
      let result = await mysql.query(request_id, db, query, [
        data.bucket_id,
      ]);
      if (result.length > 0) {
        resolve(result[0].user_id_added_by);
      } else {
        reject({
          code: 103,
          custom_message: 'No bucket with that bucket_id for this user.'
        });
      }
    } catch (e) {
      reject({ code: 103, message: { message: e.message, stack: e.stack } });
    }
  });
};

module.exports.checkIfBucketIsSubscribed = (request_id, data) => {
  return new Promise(async (resolve, reject) => {
    const query = `SELECT * FROM subscription_buckets WHERE bucket_id = ? AND user_id = ?;`;
    try {
      let result = await mysql.query(request_id, db, query, [
        data.bucket_id,
        data.user_id
      ]);
      if (result.length > 0) {
        resolve(result[0].user_id_added_by);
      } else {
        reject({
          code: 103,
          custom_message: 'No bucket with that bucket_id for this user.'
        });
      }
    } catch (e) {
      reject({ code: 103, message: { message: e.message, stack: e.stack } });
    }
  });
};



module.exports.getSecondaryBucketsIfExists = (request_id, data) => {
  return new Promise(async (resolve, reject) => {
    const query = `SELECT * FROM buckets WHERE user_id_added_by = ? AND parent_bucket_id = ? AND soft_deleted = ? ORDER BY created_at DESC;;`;
    logger.info('getSecondaryBuckets', query);
    try {
      let result = await mysql.query(request_id, db, query, [data.user_id, data.bucket_id, 0]);
      if(result.length >= 0) {
          resolve(result);
      } else {
        reject({ code: 103, custom_message: 'No secondary buckets for this parent bucket.' });
      }
    } catch (e) {
      reject({ code: 103, message: { message: e.message, stack: e.stack } });
    }
  })
}

//count of posts inside bucket
module.exports.checkCountForBucketPost = (request_id, data) => {
  return new Promise(async (resolve, reject) => {
    const query = `SELECT COUNT(*) as count FROM posts WHERE user_id = ? AND bucket_id = ? AND soft_deleted = ?;`;

    logger.info(query)
    try {
      let result = await mysql.query(request_id, db, query, [data.user_id, data.bucketId, 0]);
      if(result) {
        resolve(result[0].count);
      } else {
        reject({ code: 104, custom_message: 'No more buckets for this bucket.' })
      }
    } catch (e) {
      reject({ code: 104, message: { message: e.message, stack: e.stack } });
    }
  })
}