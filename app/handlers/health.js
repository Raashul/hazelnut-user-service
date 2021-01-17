'use strict';

const logger = require(__base + '/app/modules/common/logger');
const mysql = require(__base + '/app/modules/common/mysql');

const db = 'provisioning';

module.exports.check = async function (req, res) {
  const query = `SELECT 1+1;`;
  try {
    const [result1] = await Promise.all([mysql.query(req.request_id, db, query, [], false)]);
    logger.healthOkay(req.request_id);
    res.status(200).send('OK');
  } catch (e) {
    logger.healthError(req.request_id, e.message, e.stack);
    res.status(500).send('ERROR');
  }
};
