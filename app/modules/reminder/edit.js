'use strict';

const uuid = require('uuid/v4');

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
        typeof data.group_id !== 'undefined'
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

  module.exports.checkIfReminderExists = (request_id, data) => {
    return new Promise( async (resolve, reject) => {
      const query = `SELECT * FROM config_reminder WHERE bucket_id = ? AND user_id = ? AND group_id = ?;`;
  
      try {
        let result = await mysql.query(request_id, db, query, [data.bucket_id, data.user_id, data.group_id]);
        if(result.length >= 1)
          resolve(result);
        else {
          reject({ code: 103.4, custom_message: 'No reminders for this user.' })
        }
      } catch (e) {
        reject({ code: 102, message: { message: e.message, stack: e.stack } });
      }
    });
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

  module.exports.editInConfigTable = (request_id, data) => {
    return new Promise(async (resolve, reject) => {
        const {
          config_id,
          group_id,
        } = data;
    
        const query = `UPDATE config_reminder SET  soft_deleted = ? WHERE config_id = ? AND group_id = ?;`;
        const query_body = {
          config_id,
          group_id,
        };
    
        try {
          let result = await mysql.query(request_id, db, query, [1, query_body.config_id, query_body.group_id]);
          if (result.affectedRows === 1) {
            resolve(config_id);
          } else {
            reject({
              code: 103.3,
              message: 'Failure to edit in config_reminder table.'
            });
          }
        } catch (e) {
          reject({ code: 103, message: { message: e.message, stack: e.stack } });
        }
      });
  }

  module.exports.editInRemindersTable = (request_id, data) => {
    return new Promise(async (resolve, reject) => {
      const query = `UPDATE reminders SET status = ? WHERE config_id = ? AND group_id = ?;`;
  
      const reminder_id = uuid();
      const {
        config_id,
        group_id
      } = data;
  
      try {
        let result = await mysql.query(request_id, db, query, ["UPDATE", config_id , group_id]);
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

  module.exports.addInConfigTable = (request_id, data) => {
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
        UpdatedConfig_id,
        UpdatedGroup_id,
        time_of_day,
        timezone,
      } = data;
  
      const query = `INSERT INTO config_reminder SET ?;`;
      const config_id = UpdatedConfig_id;
      const group_id = UpdatedGroup_id;
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

  module.exports.addInRemindersTable = (request_id, data) => {
    return new Promise(async (resolve, reject) => {
      const query = `INSERT INTO reminders SET ?;`;
  
      const reminder_id = uuid();
      const {
        UpdatedConfig_id,
        UpdatedGroup_id,
        bucket_id,
        post_id,
        user_id,
        email,
        reminder_date,
        reminder_time,
        // reminder_timestamp_utc,
        timezone
      } = data;
      const config_id = UpdatedConfig_id;
      const group_id = UpdatedGroup_id;
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