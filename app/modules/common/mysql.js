'use strict';

const mysql = require('mysql');

const provisioningDBPool = require(__base + '/app/init/mysql').getprovisioningDBPool;

const logger = require(__base + '/app/modules/common/logger');

module.exports.query = (request_id, db, query, values, log) => {
  return new Promise( (resolve, reject) => {
    if(db == 'provisioning') {
      provisioningDBPool().getConnection(function(err, connection) {
        if(err) {
          // connection.release();
          logger.warn('err', err);
          reject(err);
         
        } else {
          const sql = mysql.format(query, values);
          const database_call = connection.query(sql, function (error, results, fields) {
            connection.release();
            if(log !== false) logger.debug(request_id, database_call.sql);
            if (error) {
              logger.warn('error', error);
              reject(error);
            }
            resolve(results);
          });
        }
      });
    }  else {
      reject(new Error('Database name incorrect. Internal error check common mysql'));
    }
  })
};
