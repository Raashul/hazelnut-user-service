'use strict';

const uuid = require('uuid/v4');
const validator = require('validator');

const mysql = require(__base + '/app/modules/common/mysql');
const logger = require(__base + '/app/modules/common/logger');

const db = 'provisioning';


module.exports.validation = (request_id, data) => {
  return new Promise((resolve, reject) => {
    if(validator.isUUID(data.user_id)){
      if(typeof data.post_id != 'undefined' && typeof data.user_id != 'undefined') {
        resolve();
      }
      else 
        reject({ code: 103.1, message: 'Missing children attribute.' });
    } else {
      reject({ code: 103, message: 'Attributes validation incorrect. Not UUID' });
    }
  })
}


module.exports.checkIfUserExists = (request_id, user_id) => {
  return new Promise(async (resolve, reject) => {
    const query = `SELECT * FROM users WHERE user_id = ?;`;
    try {
      let result = await mysql.query(request_id, db, query, [user_id]);
      if(result.length === 1) {
          resolve();
      } else {
        reject({ code: 103, custom_message: 'User does not exist.' })
      }
    } catch (e) {
      reject({ code: 103, message: { message: e.message, stack: e.stack } });
    }
  })
}

module.exports.checkIfPostExistsForThatUser = (request_id, data) => {
  return new Promise(async (resolve, reject) => {
    const query = `SELECT post_id FROM posts WHERE post_id = ? AND user_id = ?;`;
    logger.info('checkIfPostExistsForThatUser', query)
    try {
      let result = await mysql.query(request_id, db, query, [data.post_id, data.user_id]);
      if(result.length === 1) {
        resolve();
      } else {
        reject({ code: 103, custom_message: 'Post does not exist for this user.' })
      }
    } catch (e) {
      reject({ code: 103, message: { message: e.message, stack: e.stack } });
    }
  })
}


module.exports.removeFromPostTable = (request_id, data) => {
  return new Promise(async (resolve, reject) => {
    const { post_id, user_id } = data;
    const query = 'UPDATE `posts` SET soft_deleted = ? WHERE post_id = ? AND user_id = ?;'
    logger.info('deletePostsTable',query )
    const query_body = {
      post_id,
      user_id
    }
    try {
      let result = await mysql.query(request_id, db, query, [1, query_body.post_id, query_body.user_id]);
      if(result.affectedRows === 1) {
        resolve({data});
      } else {
        reject({ code: 103.3, message: 'Failure to delete post.' })
      }
    
    } catch(e) {
      reject({ code: 103, message: { message: e.message, stack: e.stack } });

    }
  })
}
