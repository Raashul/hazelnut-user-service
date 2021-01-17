'use strict';

const uuid = require('uuid/v4');
const validator = require('validator');

const mysql = require(__base + '/app/modules/common/mysql');
const logger = require(__base + '/app/modules/common/logger');

const db = 'provisioning';




//Validation:
//check if there exists atleast one post created by the user.
module.exports.validation = (request_id, data) => {
  return new Promise(async (resolve, reject) => {
    const query = `SELECT post_id FROM posts WHERE user_id = ? AND soft_deleted = 0`;
    try {
      let result = await mysql.query(request_id, db, query, [data.user_id]);
      if(result.length >= 0) {
        resolve();
      }
      else {
        logger.warn({})
        reject({code: 103.1, custom_message: 'User has not created any posts yet.'})
      }
    } catch (e) {
      reject({ code: 102, message: { message: e.message, stack: e.stack } });
    }    

  })
}

module.exports.checkIfParentBucket = (request_id, data) => {
  return new Promise(async (resolve, reject) => {
    const query = `SELECT COUNT(*) as count FROM buckets WHERE user_id_added_by = ? AND bucket_id = ? AND type = ? AND soft_deleted = 0`;
    try {
      let result = await mysql.query(request_id, db, query, [data.user_id, data.bucket_id, 'parent']);
      logger.info('result', result[0].count);
      if(result[0].count > 0) {
        resolve(true);
      } else {
        resolve(false)
      }
    } catch (e) {
      reject({ code: 102, message: { message: e.message, stack: e.stack } });
    }    

  })
}




//if there are secondary buckets
//randomly pick one and resolve
module.exports.pickRandomBucket = (request_id, data) => {
  return new Promise(async (resolve, reject) => {
    const query = `SELECT * FROM buckets WHERE user_id_added_by = ? AND parent_bucket_id = ? AND soft_deleted = 0;`;
    try {
      let result = await mysql.query(request_id, db, query, [data.user_id, data.bucket_id]);
      if(result.length > 0) {
        const bucket = result[Math.floor(Math.random() * result.length)];

        resolve(bucket.bucket_id);
      } else {
        reject({code: 103, custom_message: ''})
      }
    } catch (e) {
      reject({ code: 103, message: { message: e.message, stack: e.stack } });
    }    

  })
}


module.exports.checkIfPostExistInsideBucket = (request_id, data) => {
  return new Promise(async (resolve, reject) => {
    const query = `SELECT COUNT(*) as count FROM posts WHERE user_id = ? AND bucket_id = ? AND soft_deleted = 0;`;
    logger.info('checkIfPostExistInsideBucket', query);
    
    try {
      let result = await mysql.query(request_id, db, query, [data.user_id, data.random_bucket_id_selected, 0]);
      if(result[0].count > 0) {
        resolve(true);
      } else {
        logger.debug('No posts inside this bucket. Selecting another bucket')
        resolve(false)
      } 
    } catch (e) {
      reject({ code: 102, message: { message: e.message, stack: e.stack } });
    }    

  })
}



//check atleast 1 post exists
//randomly pick one and resolve
module.exports.pickRandomPost = (request_id, data) => {
  return new Promise(async (resolve, reject) => {
    const query = `SELECT * FROM posts WHERE user_id = ? AND bucket_id = ? AND soft_deleted = 0;`;
    try {
      let result = await mysql.query(request_id, db, query, [data.user_id, data.random_bucket_id_selected, 0]);
      if(result.length == 0) {
        reject({code: 103.2, custom_message: `No post exists inside bucket`})
      } else {
        if(result.length > 1) {
          const post = result[Math.floor(Math.random() * result.length)];
          resolve(post);
        } else {
          resolve(result[0])
        }
      }
    } catch (e) {
      reject({ code: 103, message: { message: e.message, stack: e.stack } });
    }    

  })
}



module.exports.getUserInformation = (request_id, data) => {
  return new Promise(async (resolve, reject) => {
    const query = `SELECT email, username, first_name, last_name FROM users WHERE user_id = ?;`;
    logger.info('getUserInformation', query);
    try {
      let result = await mysql.query(request_id, db, query, [data.user_id]);
      if(result.length > 0){
        resolve(result[0].email)
      } else {
        reject({code: 103.2, custom_message: 'No user with that userid'})
      }
    } catch (e) {
      reject({ code: 103, message: { message: e.message, stack: e.stack } });
    }    
  })
}


module.exports.getChildBuckets = (request_id, data) => {
  return new Promise(async (resolve, reject) => {
    const type = 'child'
    const query = `SELECT * FROM buckets WHERE user_id_added_by = ? AND type = ? AND parent_bucket_id =? AND soft_deleted = 0;`;
    logger.info('getSecondaryBuckets', query);
    try {
      let result = await mysql.query(request_id, db, query, [data.user_id, type, data.bucket_id]);
      if(result.length >= 0) {
          resolve(result);
      } else {
        reject({ code: 103, custom_message: 'No child buckets for this user.' });
      }
    } catch (e) {
      reject({ code: 103, message: { message: e.message, stack: e.stack } });
    }
  })
}