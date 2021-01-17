'use strict';

const validator = require('validator');
const mysql = require(__base + '/app/modules/common/mysql');
const logger = require(__base + '/app/modules/common/logger');

const db = 'provisioning';


module.exports.checkIfBucketIsSubscribed = (request_id, data) => {
  return new Promise(async (resolve, reject) => {
    const query = `SELECT * FROM subscription_buckets WHERE bucket_id = ? AND user_id = ?;`;
    try {
      let result = await mysql.query(request_id, db, query, [
        data.bucket_id,
        data.user_id
      ]);
      if (result.length > 0) {
        resolve();
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
}

module.exports.removeFromSubscriptionTable = (request_id, data) => {
  return new Promise(async (resolve, reject) => {
    const query = `DELETE FROM subscription_buckets WHERE bucket_id = ? AND user_id = ?;`;
    try {
      let result = await mysql.query(request_id, db, query, [
        data.bucket_id,
        data.user_id
      ]);
      if (result.affectedRows > 0) {
        resolve();
      } else {
        reject({
          code: 103,
          custom_message: 'No such bucket to delete.'
        });
      }
    } catch (e) {
      reject({ code: 103, message: { message: e.message, stack: e.stack } });
    }
  });
}

