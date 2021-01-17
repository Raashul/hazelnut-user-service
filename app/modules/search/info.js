'use strict'; 

const mysql = require(__base + '/app/modules/common/mysql');
const logger = require(__base + '/app/modules/common/logger');

const db = 'provisioning';

module.exports.checkIfBucketExists = (request_id, data) => {
    return new Promise(async (resolve, reject) => {
      const query = `SELECT * FROM buckets WHERE user_id_added_by = ? AND soft_deleted = ?;`;
      try {
        let result = await mysql.query(request_id, db, query, [data.user_id, 0]);
        if(result.length > 0) {
            resolve();
        } else {
          reject({ code: 103, custom_message: 'No buckets for that user.' })
        }
      } catch (e) {
        reject({ code: 103, message: { message: e.message, stack: e.stack } });
      }
    })
  }

  module.exports.findSimilarParentBuckets = (request_id, data) => {
    return new Promise(async (resolve, reject) => {
      const type = 'parent'
      const query = `SELECT * FROM buckets WHERE user_id_added_by = ? AND type = ? AND bucket_name LIKE CONCAT('%' ? '%') AND soft_deleted = ?;`;
      try {
        let result = await mysql.query(request_id, db, query, [data.user_id, type, data.bucket_name, 0]);
        if(result.length >= 0) {
          resolve(result);
        }
      } catch (e) {
        reject({ code: 103, message: { message: e.message, stack: e.stack } });
      }
    })
  }

  module.exports.findSimilarChildBuckets = (request_id, data) => {
    return new Promise(async (resolve, reject) => {
      const type = 'child'
      const query = `SELECT * FROM buckets WHERE user_id_added_by = ? AND type = ? AND bucket_name LIKE CONCAT('%' ? '%') AND soft_deleted = ?;`;
      logger.info('findSimilarChildBuckets', query);
      try {
        let result = await mysql.query(request_id, db, query, [data.user_id, type , data.bucket_name, 0]);
        if(result.length >= 0) {
            resolve(result);
        }
      } catch (e) {
        reject({ code: 103, message: { message: e.message, stack: e.stack } });
      }
    })
  }