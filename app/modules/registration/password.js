const mysql = require(__base + '/app/modules/common/mysql.js');
const axios = require('axios');
const db = 'provisioning';
const config = require(__base + '/app/config/config');
const uuid = require('uuid/v4');

module.exports.validation = (request_id, data) => {
  return new Promise((resolve, reject) => {
    const email_regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email_regex.test(String(data).toLowerCase())) {
      resolve();
    } else {
      reject({ code: 103.2, message: 'Attributes validation incorrect.' });
    }
  });
};

module.exports.generateCode = () => {
  return new Promise((resolve, reject) => {
    resolve(
      Math.random()
        .toString(36)
        .slice(-6)
    );
  });
};

module.exports.sendEmail = (request_id, email, referral_code) => {
  return new Promise(async (resolve, reject) => {
    try {
      await axios
        .post(config.services.notification + '/api/notification/password', {
          email,
          referral_code
        })
        .then(response => {
          resolve();
        })
        .catch(error => {
          let { code, message } = error.response.data.error;
          reject({ code, message });
        });
    } catch (e) {
      reject({ code: 102, message: 'Internal Server Error' });
    }
  });
};

module.exports.updateUserTable = (request_id, email, password) => {
  return new Promise(async (resolve, reject) => {
    let queryString = 'UPDATE users SET password=? WHERE email=?';
    try {
      let result = await mysql.query(request_id, db, queryString, [
        password,
        email
      ]);
      
      if (result.affectedRows == 1) {
        resolve();
      } else {
        reject({ code: 102, custom_message: 'Internal Server Error' });
      }
    } catch (e) {
      reject({ code: 102, custom_message: 'Internal Server Error' });
    }
  });
};

module.exports.insertIntoTable = (request_id, email, code) => {
  return new Promise(async (resolve, reject) => {
    let queryString = 'INSERT INTO recover_password SET ?';
    let data = {
      id: uuid(),
      email,
      code
    };
    try {
      let result = await mysql.query(request_id, db, queryString, data);
      if (result.affectedRows == 1) {
        resolve();
      } else {
        reject({ code: 102, custom_message: 'Internal Server Error' });
      }
    } catch (e) {
      reject(e);
    }
  });
};

module.exports.validateCode = (request_id, code) => {
  return new Promise(async (resolve, reject) => {
    if (code.length === 6) {
      resolve();
    } else {
      reject({
        code: 103,
        custom_message: 'Please make sure you enter the correct code'
      });
    }
  });
};

module.exports.checkTable = (request_id, email, code) => {
  return new Promise(async (resolve, reject) => {
    let queryString =
      'Select * from recover_password Where email = ? AND code = ? AND soft_deleted = 0';
    try {
      let result = await mysql.query(request_id, db, queryString, [
        email,
        code
      ]);
      if (result.length == 1) {
        resolve(result[0]);
      } else {
        reject({
          code: 103,
          custom_message: 'Please make sure the code matches'
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

module.exports.checkExpiry = (request_id, id, expiry) => {
  return new Promise(async (resolve, reject) => {
    let split_date = expiry.split(' ');
    expiry_date = new Date([split_date[0], 'T', split_date[1], 'Z'].join(''));
    if ((new Date() - expiry_date) / 1000 > 3600) {
      try {
        let queryString =
          'UPDATE recover_password SET soft_deleted = 1 Where id = ? ';
        let result = await mysql.query(request_id, db, queryString, id);
        if (result.affectedRows == 1) {
          reject({ code: 103, custom_message: 'Your code has expired' });
        } else {
          reject({ code: 102, custom_message: 'Internal Server Error' });
        }
      } catch (e) {
        reject(e);
      }
    } else {
      resolve();
    }
  });
};

module.exports.softDelete = (request_id, email) => {
  return new Promise(async (resolve, reject) => {
    try {
      let queryString =
        'UPDATE recover_password SET soft_deleted = 1 Where email = ?';
      let result = await mysql.query(request_id, db, queryString, email);
      if (result) {
        resolve();
      } else {
        reject({ code: 102, custom_message: 'Internal Server Error' });
      }
    } catch (e) {
      reject(e);
    }
  });
};
