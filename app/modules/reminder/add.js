'use strict';

const uuid = require('uuid/v4');
const validator = require('validator');

const mysql = require(__base + '/app/modules/common/mysql');
const logger = require(__base + '/app/modules/common/logger');

const db = 'provisioning';

module.exports.init = (request_id, data) => {
  return new Promise((resolve, reject) => {
    if (
      typeof data.number_of_posts !== 'undefined' &&
      typeof data.days !== 'undefined' &&
      typeof data.bucket_id !== 'undefined' &&
      typeof data.type !== 'undefined' &&
      typeof data.user_id !== 'undefined' &&
      typeof data.bucket_name !== 'undefined' &&
      typeof data.group_id !== 'undefined' &&
      typeof data.timezone !== 'undefined'
    ) {
      const days = data.days;
      if (days.length > 0 && days.length <= 7) {
        resolve();
      }
    } else {
      reject({ code: 103.1, custom_message: 'Missing parent attribute.' });
    }
  });
};

module.exports.initDaily = (request_id, data) => {
  return new Promise((resolve, reject) => {
    if (
      typeof data.number_of_posts !== 'undefined' &&
      typeof data.bucket_id !== 'undefined' &&
      typeof data.type !== 'undefined' &&
      typeof data.user_id !== 'undefined' &&
      typeof data.bucket_name !== 'undefined' &&
      typeof data.group_id !== 'undefined' &&
      typeof data.timezone !== 'undefined'
    ) {
      resolve();
    } else {
      reject({ code: 103.1, custom_message: 'Missing parent attribute.' });
    }
  });
};

module.exports.checkIfReminderAlreadyExists = (request_id, data) => {
  return new Promise(async (resolve, reject) => {
    const { user_id, bucket_id } = data;
    const query = `SELECT COUNT(DISTINCT(group_id)) as count FROM config_reminder WHERE user_id = ? AND bucket_id = ? AND soft_deleted = 0`;
    try {
      let result = await mysql.query(request_id, db, query, [user_id, bucket_id,]);
      if(result[0].count >= 1) {
        reject({ code: 103, custom_message: 'Cannot set more than 1 reminders for one bucket.' })
      } else {
        resolve();
      }
    } catch (e) {
      reject({ code: 103, message: { message: e.message, stack: e.stack } });
    }
  })
}


module.exports.checkIfDaysAreaValid = (request_id, days) => {
  return new Promise((resolve, reject) => {
    days.forEach(day => {
      day = day.toLowerCase();
      if (
        day.toLowerCase() === 'sunday' ||
        day.toLowerCase() === 'monday' ||
        day.toLowerCase() === 'tuesday' ||
        day.toLowerCase() === 'wednesday' ||
        day.toLowerCase() === 'thursday' ||
        day.toLowerCase() === 'friday' ||
        day.toLowerCase() === 'saturday'
      ) {
        resolve();
      } else {
        reject({ code: 103.1, custom_message: 'Incorrect days format' });
      }
    });
  });
};

module.exports.specificReminderInit = (request_id, data) => {
  //step 1: check if any necessary attributes are null or undefined
  return new Promise((resolve, reject) => {
    if (
      typeof data.number_of_posts !== 'undefined' &&
      typeof data.day !== 'undefined' &&
      typeof data.time !== 'undefined' &&
      typeof data.bucket_id !== 'undefined' &&
      typeof data.type !== 'undefined' &&
      typeof data.user_id !== 'undefined' &&
      typeof data.group_id !== 'undefined'
    ) {
      resolve();
    } else {
      reject({ code: 103.1, custom_message: 'Missing parent attribute.' });
    }
  });
};

module.exports.genericReminderValidation = (request_id, data) => {
  //step 1: check if any necessary attributes are null or undefined
  return new Promise((resolve, reject) => {
    if (
      data.time_of_day !== '' &&
      data.timezone !== '' &&
      data.reminder_date !== '' &&
      data.reminder_time !== '' &&
      // data.reminder_timestamp_utc !== '' &&
      data.email !== ''
    ) {
      resolve();
    } else {
      reject({ code: 103.1, custom_message: 'Missing required parameters to generate reminder.' });
    }
  });
};

module.exports.dailyReminderValidation = (request_id, data) => {
  //step 1: check if any necessary attributes are null or undefined
  return new Promise((resolve, reject) => {
    if (
      data.timezone !== '' &&
      data.reminder_date !== '' &&
      data.reminder_time !== '' &&
      // data.reminder_timestamp_utc !== '' &&
      data.email !== ''
    ) {
      resolve();
    } else {
      reject({ code: 103.1, custom_message: 'Missing required parameters to generate reminder.' });
    }
  });
};
 
// module.exports.specificReminderValidation = (request_id, data) => {
//   return new Promise((resolve, reject) => {
//     //step 1: check if any necessary attributes are null or undefined
//     if(
//       data.number_of_posts > 0 &&
//       data.day >= 0 && data.day <= 6 &&
//       //data.time >=0 && data.time <=24 &&
//       data.type === 'weekly' || data.type === 'daily' || data.type == 'monthly'
//     ) {
//       resolve();
//     } else {
//       reject({code: 103.1, message: 'Parent attribution validation'})
//     }

//   })
// }

module.exports.insertIntoConfigTable = (request_id, data) => {
  return new Promise(async (resolve, reject) => {
    const {
      number_of_posts,
      day,
      reminder_time,
      bucket_id,
      type,
      sub_type,
      user_id,
      bucket_name,
      group_id,
      config_id,
      time_of_day,
      timezone,
    } = data;

    const query = `INSERT INTO config_reminder SET ?;`;
    const query_body = {
      config_id,
      user_id,
      group_id,
      bucket_id,
      number_of_posts,
      day,
      reminder_time,
      type,
      bucket_name,
      time_of_day,
      timezone
    };

    try {
      let result = await mysql.query(request_id, db, query, [query_body]);
      if (result.affectedRows === 1) {
        resolve(config_id);
      } else {
        reject({
          code: 103.3,
          message: 'Failure to insert into config_reminder table.'
        });
      }
    } catch (e) {
      reject({ code: 103, message: { message: e.message, stack: e.stack } });
    }
  });
};

module.exports.insertIntoRemindersTable = (request_id, data) => {
  return new Promise(async (resolve, reject) => {
    const query = `INSERT INTO reminders SET ?;`;

    const reminder_id = uuid();
    const {
      config_id,
      bucket_id,
      post_id,
      user_id,
      email,
      reminder_date,
      reminder_time,
      // reminder_timestamp_utc,
      timezone,
      group_id
    } = data;

    const query_body = {
      reminder_id,
      config_id,
      bucket_id,
      post_id,
      user_id,
      email,
      reminder_date,
      reminder_time,
      status : 'ACTIVE',
      // reminder_timestamp_utc,
      timezone,
      group_id
    };

    try {
      let result = await mysql.query(request_id, db, query, [query_body]);
      if (result.affectedRows === 1) {
        resolve(reminder_id);
      } else {
        reject({
          code: 103.3,
          message: 'Failure to insert into reminders table.'
        });
      }
    } catch (e) {
      reject({ code: 103, message: { message: e.message, stack: e.stack } });
    }
  });
};
