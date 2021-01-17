const mysql = require(__base + '/app/modules/common/mysql');
const uuid = require('uuid/v4');
const db = 'provisioning';

module.exports.addfeed = (request_id, user_id, data) => {
  return new Promise(async (resolve, reject) => {
    data.user_id = user_id;
    data.id = uuid();
    let queryString = `INSERT INTO feedback SET ?`;
    try {
      let result = await mysql.query(request_id, db, queryString, data);
      if (result.affectedRows == 1) {
        resolve();
      } else {
        reject({ code: 102, custom_message: 'Internal server error' });
      }
    } catch (e) {
      reject(e);
    }
  });
};
