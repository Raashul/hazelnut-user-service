'use strict';

const validator = require('validator');
const mysql = require(__base + '/app/modules/common/mysql');
const logger = require(__base + '/app/modules/common/logger');

const db = 'provisioning';

module.exports.getAllRemindersForUser = (request_id, data) => {
  return new Promise(async (resolve, reject) => {
    const query = `SELECT bucket_id, bucket_name, type, day, number_of_posts, group_id, reminder_time FROM config_reminder WHERE user_id = ? AND soft_deleted = 0;`;
    logger.info('getAllReminders', query);
    try {
      let result = await mysql.query(request_id, db, query, [data.user_id]);
      if (result.length >= 0) {
        resolve(result);
      }
    } catch (e) {
      reject({ code: 103, message: { message: e.message, stack: e.stack } });
    }
  });
};

module.exports.filterDataStructure = (request_id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const filteredData = {};
      data.forEach(element => {
        if (element.group_id in filteredData) {
          filteredData[element.group_id].day.push(element.day);
        } else {
          filteredData[element.group_id] = {
            group_id: element.group_id,
            bucket_id: element.bucket_id,
            bucket_name: element.bucket_name,
            number_of_posts: 1,
            type: element.type,
            time: element.reminder_time,
            day: [element.day]
          };
        }
      });
      resolve(Object.values(filteredData));
    } catch (e) {
      reject({ code: 500, message: { message: e.message, stack: e.stack } });
    }
  });
};
