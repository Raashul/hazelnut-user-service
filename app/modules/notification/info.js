'use strict';
const mysql = require(__base + '/app/modules/common/mysql');

const db = 'provisioning';

module.exports.init = (request_id, data) => {
  return new Promise((resolve, reject) => {
    try {
      resolve();
    } catch(e) {
      reject({ code: 103, message: 'Attributes validation incorrect. Not UUID' });
    }
  })
}


module.exports.getListOfEmailsSent = (request_id, data) => {
  return new Promise(async (resolve, reject) => {
    const { user_id } = data;
    try {
      const query = `SELECT r.bucket_id as bucket_id, r.post_id as post_id, r.reminder_date as reminder_date, r.reminder_time as reminder_time, b.bucket_name as bucket_name, b.description as description FROM reminders r JOIN buckets b on r.user_id = b.user_id_added_by  WHERE r.user_id = ? AND r.status = ?;`;
      let result = await mysql.query(request_id, db, query, [user_id, 'SENT']);
      if(result.length >= 0) {
        resolve(result)
      }
    } catch(e) {
      reject({ code: 103, message: { message: e.message, stack: e.stack } });
    }
  })
}






