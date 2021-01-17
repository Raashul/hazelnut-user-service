'use strict';

const uuid = require('uuid/v4');

const mysql = require(__base + '/app/modules/common/mysql');
const logger = require(__base + '/app/modules/common/logger');

const db = 'provisioning';



module.exports.init = (request_id, data) => {
  return new Promise(async (resolve, reject) => {
    if(data.bucket_id  !== 'undefined' && data.user_id !== 'undefined'){
      resolve();
    } else {
      reject({ code: 103.1, message: 'Missing parent attribute.' });
    }
  })
}

module.exports.checkIfBucketAlreadyExists = (request_id, data) => {
  return new Promise( async (resolve, reject) => {
    const query = `SELECT * FROM buckets WHERE bucket_id = ? AND user_id_added_by = ?;`;

    try {
      let result = await mysql.query(request_id, db, query, [data.bucket_id, data.user_id]);
      if(result.length === 1)
        resolve();
      else {
        reject({ code: 103.4, custom_message: 'Bucket with same name already exists.' })
      }
    } catch (e) {
      reject({ code: 102, message: { message: e.message, stack: e.stack } });
    }
  });
}

module.exports.updateBucketsTable = (request_id, data) => {
 return new Promise(async (resolve, reject) => {
  
    //check if parent bucket exists. or set null
    const user_id_added_by = data.user_id;
    const { bucket_id } = data;

    const query = 'UPDATE buckets SET isPinned = ? WHERE user_id_added_by = ? AND bucket_id = ?';

    const query_body = { user_id_added_by, bucket_id};

    try {
      let result = await mysql.query(request_id, db, query, [1, query_body.user_id_added_by, query_body.bucket_id]);
      if(result.affectedRows === 1) {
        resolve(bucket_id);
      } else {
        reject({ code: 103.3, message: 'Failure to pin bucket.' })
      }
    
    } catch(e) {
      reject({ code: 103, message: { message: e.message, stack: e.stack } });

    }

 })
}


module.exports.unpinBuckets = (request_id, data) => {
  return new Promise(async (resolve, reject) => {
   
     //check if parent bucket exists. or set null
     const user_id_added_by = data.user_id;
     const { bucket_id } = data;
 
     const query = 'UPDATE buckets SET isPinned = ? WHERE user_id_added_by = ? AND bucket_id = ?';
 
     const query_body = { user_id_added_by, bucket_id};
 
     try {
       let result = await mysql.query(request_id, db, query, [0, query_body.user_id_added_by, query_body.bucket_id]);
       if(result.affectedRows === 1) {
         resolve(bucket_id);
       } else {
         reject({ code: 103.3, message: 'Failure to pin bucket.' })
       }
     
     } catch(e) {
       reject({ code: 103, message: { message: e.message, stack: e.stack } });
 
     }
 
  })
 }