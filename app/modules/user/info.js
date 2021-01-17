'use strict';

const validator = require('validator');
const mysql = require(__base + '/app/modules/common/mysql');
const logger = require(__base + '/app/modules/common/logger');

const db = 'provisioning';

module.exports.validation = (request_id, response_body) => {
  return new Promise((resolve, reject) => {
    if(validator.isUUID(response_body.user_id)){
      logger.info(request_id, response_body.user_id);
      resolve();
    } else {
      reject({ code: 103, message: 'Attributes validation incorrect. Not UUID' });
    }
  })
}

module.exports.getUserInformation = (request_id, data) => {
  return new Promise(async (resolve, reject) => {
    const query = `SELECT email, username, first_name, last_name FROM users WHERE user_id = ?;`;
    logger.info(query);
    try {
      let result = await mysql.query(request_id, db, query, [data.user_id]);
      if(result.length > 0){
        resolve(result[0])
      } else {
        reject({code: 103.2, custom_message: 'No user with that userid'})
      }
    } catch (e) {
      reject({ code: 103, message: { message: e.message, stack: e.stack } });
    }    
  })
}