'use strict';

const uuid = require('uuid/v4');
const validator = require('validator');

const mysql = require(__base + '/app/modules/common/mysql');
const logger = require(__base + '/app/modules/common/logger');


const db = 'provisioning';

module.exports.init = (request_id, data) => {
  return new Promise((resolve, reject) => {
    if(typeof data.bucket === 'undefined' ) {
      reject({ code: 103.1, custom_message: 'Bucket not provided' });
    } else if(typeof data.bucket_admin === 'undefined') {
      reject({ code: 103.1, custom_message: 'Bucket Admin information not provided' });
    } else {
      resolve();
    }
  });
};


module.exports.checkIfEmailExists = (request_id, data) => {
  return new Promise( async (resolve, reject) => {
    const query = `SELECT user_id FROM users WHERE email = ?;`;
    const { bucket_admin } = data;
    try {
      let result = await mysql.query(request_id, db, query, [data.email]);
      if(result.length === 1) {
        resolve(result[0].user_id);
      }
        
      else {
        reject({ code: 103.4, custom_message: 'No account associated with this email.' })
      }
    } catch (e) {
      reject({ code: 102, message: { message: e.message, stack: e.stack } });
    }
  });
}


module.exports.checkIfBucketExists = (request_id, data) => {
  return new Promise( async (resolve, reject) => {
    const query = `SELECT * FROM buckets WHERE bucket_id = ? AND user_id_added_by = ? AND soft_deleted = 0;`;

    try {
      let result = await mysql.query(request_id, db, query, [data.bucket.bucket_id, data.bucket_admin.user_id]);
      if(result.length === 1)
        resolve();
      else {
        reject({ code: 103.4, custom_message: 'Bucket no longer exists.' })
      }
    } catch (e) {
      reject({ code: 102, message: { message: e.message, stack: e.stack } });
    }
  });
}

module.exports.checkIfAlreadySubscribed = (request_id, data) => {
  return new Promise( async (resolve, reject) => {
    const query = `SELECT bucket_id FROM subscription_buckets WHERE bucket_id = ? AND user_id = ?;`;

    try {
      let result = await mysql.query(request_id, db, query, [data.bucket.bucket_id, data.current_user_id]);
      if(result.length === 0)
        resolve();
      else {
        reject({ code: 103.4, custom_message: 'You have already subscriped to this bucket.' })
      }
    } catch (e) {
      reject({ code: 102, message: { message: e.message, stack: e.stack } });
    }
  });
}


module.exports.addToSubscribtionTableBucket = (request_id, data) => {
  return new Promise( async (resolve, reject) => {
    const query = `INSERT INTO subscription_buckets SET ?;`;
    const subscription_id = uuid();
    const { bucket_admin } = data;
    const queryBody = {
      subscription_id,
      bucket_admin_email : bucket_admin.email,
      bucket_id: data.bucket.bucket_id,
      user_id: data.current_user_id,
      bucket_admin_user_id: bucket_admin.user_id
    }

    try {
      let result = await mysql.query(request_id, db, query, [queryBody]);
      if(result.affectedRows === 1)
        resolve();
      else {
        reject({ code: 103.3, message: 'Failure to insert into subscription_buckets.' })
      }
    } catch (e) {
      reject({ code: 103, message: { message: e.message, stack: e.stack } });
    }
  });
}