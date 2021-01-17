'use strict';

const uuid = require('uuid/v4');

const mysql = require(__base + '/app/modules/common/mysql');
const logger = require(__base + '/app/modules/common/logger');

const db = 'provisioning';



module.exports.init = (request_id, data) => {
  return new Promise(async (resolve, reject) => {
    if(data.bucket_name !== 'undefined' && data.bucket_id !==  'undefined'){
      resolve();
    } else {
      reject({ code: 103.1, message: 'Missing parent attribute.' });
    }
  })
}


module.exports.validation = (request_id, data) => {
  return new Promise(async (resolve, reject) => {
    if(typeof data.bucket_name !== "undefined" && typeof data.bucket_id !==  'undefined' && data.bucket_name.length !== 0 ){
        resolve();
    } else {
      reject({ code: 103.1, message: 'Invalid parent attribute.' });
    }
  })
}

module.exports.checkIfBucketExists = (request_id, data) => {
  return new Promise( async (resolve, reject) => {
    const query = `SELECT * FROM buckets WHERE bucket_id = ? AND user_id_added_by = ?;`;

    try {
      let result = await mysql.query(request_id, db, query, [data.bucket_id, data.user_id]);
      if(result.length === 1)
        resolve();
      else {
        reject({ code: 103.4, custom_message: 'No such bucket for this user.' })
      }
    } catch (e) {
      reject({ code: 102, message: { message: e.message, stack: e.stack } });
    }
  });
}

module.exports.editBucket = (request_id, data) => {
  return new Promise(async (resolve, reject) => {

    const { user_id, bucket_name, bucket_id, cover_image } = data;

    const query = 'UPDATE buckets SET bucket_name = ?, cover_image = ? WHERE user_id_added_by = ? AND bucket_id = ?';

    const query_body = { bucket_id, bucket_name, cover_image, user_id };

    try {
      let result = await mysql.query(request_id, db, query, [query_body.bucket_name, query_body.cover_image, query_body.user_id, query_body.bucket_id]);
      if(result.affectedRows === 1) {
        resolve();
      } else {
        reject({ code: 103.3, message: 'Failure to update bucket.' })
      }
    
    } catch(e) {
      reject({ code: 102, message: { message: e.message, stack: e.stack } });

    }

 })
}


module.exports.deleteBucket = (request_id, data) => {
  return new Promise(async (resolve, reject) => {

    const { user_id, bucket_id } = data;

    const query = 'DELETE FROM buckets WHERE user_id_added_by = ? AND bucket_id = ?';

    const query_body = { bucket_id, user_id };

    try {
      let result = await mysql.query(request_id, db, query, [query_body.user_id, query_body.bucket_id]);
      if(result.affectedRows === 1) {
        resolve();
      } else {
        reject({ code: 103.3, message: 'Failure to delete bucket.' })
      }
    
    } catch(e) {
      reject({ code: 102, message: { message: e.message, stack: e.stack } });

    }

 })
}
