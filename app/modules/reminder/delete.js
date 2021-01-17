'use strict';

const uuid = require('uuid/v4');

const mysql = require(__base + '/app/modules/common/mysql');
const logger = require(__base + '/app/modules/common/logger');

const db = 'provisioning';



module.exports.init = (request_id, data) => {

  return new Promise(async (resolve, reject) => {
    if(data.user_id !== 'undefined' && data.bucket_id !==  'undefined' && data.group_id !==  'undefined'){

      if(typeof data.bucket_id !== "undefined"  && typeof data.user_id !== 'undefined' && typeof data.group_id !== 'undefined'){
        resolve();
      }
      else
        reject({ code: 103.1, message: 'Invalid parent attribute.' });
    } else {
      reject({ code: 103.1, message: 'Missing parent attribute.' });
    }
  })
}

module.exports.checkIfReminderExists = (request_id, data) => {
  return new Promise( async (resolve, reject) => {
    const query = `SELECT * FROM config_reminder WHERE bucket_id = ? AND user_id = ? AND group_id = ?;`;

    try {
      let result = await mysql.query(request_id, db, query, [data.bucket_id, data.user_id, data.group_id]);
      if(result.length >= 1)
        resolve();
      else {
        reject({ code: 103.4, custom_message: 'No reminders for this user.' })
      }
    } catch (e) {
      reject({ code: 102, message: { message: e.message, stack: e.stack } });
    }
  });
}


module.exports.deleteReminderConfigForBucket = (request_id, data) => {
  return new Promise(async (resolve, reject) => {

    const { user_id, bucket_id, group_id } = data;

    const query = 'DELETE FROM config_reminder WHERE user_id = ? AND bucket_id = ? AND group_id = ?';
    const query_body = { bucket_id, user_id, group_id };

    try {
      let result = await mysql.query(request_id, db, query, [query_body.user_id, query_body.bucket_id, query_body.group_id]);
      if(result.affectedRows > 0) {
        resolve();
      } else {
        reject({ code: 103.3, message: 'No reminders to delete.' })
      }
    
    } catch(e) {
      reject({ code: 102, message: { message: e.message, stack: e.stack } });
    }
 })
}


module.exports.deleteFromRemindersTable = (request_id, data) => {
  return new Promise(async (resolve, reject) => {

    const { user_id, bucket_id, group_id } = data;

    const query = 'DELETE FROM reminders WHERE user_id = ? AND bucket_id = ? AND group_id = ?';
    const query_body = { bucket_id, user_id, group_id };

    try {
      let result = await mysql.query(request_id, db, query, [query_body.user_id, query_body.bucket_id, query_body.group_id]);
      if(result.affectedRows > 0) {
        resolve();
      } else {
        reject({ code: 103.3, message: 'Failure to delete reminders.' })
      }
    
    } catch(e) {
      reject({ code: 102, message: { message: e.message, stack: e.stack } });

    }

 })
}
