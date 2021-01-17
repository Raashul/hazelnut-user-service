'use strict';

const validator = require('validator');
const mysql = require(__base + '/app/modules/common/mysql');
const logger = require(__base + '/app/modules/common/logger');

const db = 'provisioning';

module.exports.validation = (request_id, data) => {
	return new Promise((resolve, reject) => {
		resolve();
		if (validator.isUUID(data.user_id)) {
			logger.info(request_id, data.user_id);
			resolve();
		} else {
			reject({ code: 103, message: 'Attributes validation incorrect. Not UUID' });
		}
	});
};

module.exports.checkParentBucketsForThatUser = (request_id, data) => {
	return new Promise(async (resolve, reject) => {
		const query = `SELECT * FROM buckets WHERE user_id_added_by = ? AND parent_bucket_id IS NULL  AND soft_deleted   = ?  ORDER BY created_at DESC;`;
		try {
			let result = await mysql.query(request_id, db, query, [ data.user_id, 0 ]);
			if (result.length >= 0) {
				resolve(result);
			} else {
				reject({ code: 103, custom_message: 'No buckets for that user.' });
			}
		} catch (e) {
			reject({ code: 103, message: { message: e.message, stack: e.stack } });
		}
	});
};

module.exports.getRemindersIfExists = (request_id, data) => {
	return new Promise(async (resolve, reject) => {
		const query = `SELECT type, time_of_day, group_id FROM config_reminder WHERE user_id = ? AND bucket_id = ? AND soft_deleted = ?`;
		logger.info('getRemindersIfExists', query);
		try {
			let result = await mysql.query(request_id, db, query, [ data.user_id_added_by, data.bucket_id, 0 ]);
			if (result.length > 0) {
				resolve(result[0]);
			} else {
				resolve(null);
			}
		} catch (e) {
			reject({ code: 103, message: { message: e.message, stack: e.stack } });
		}
	});
};

//count number of child buckets for parent bucket
module.exports.numberOfChildBuckets = (request_id, data) => {
	return new Promise(async (resolve, reject) => {
		const query = `SELECT COUNT(*) as count FROM buckets WHERE user_id_added_by = ? AND parent_bucket_id = ? AND soft_deleted = ?;`;

		logger.info('numberOfChildBuckets', query);
		try {
			let result = await mysql.query(request_id, db, query, [ data.user_id_added_by, data.bucket_id, 0 ]);
			console.log('result', result);
			if (result) {
				resolve(result[0].count);
			} else {
				reject({ code: 104, custom_message: 'No child buckets for this bucket.' });
			}
		} catch (e) {
			reject({ code: 104, message: { message: e.message, stack: e.stack } });
		}
	});
};

//count of posts inside bucket
module.exports.numberOfPosts = (request_id, data) => {
	return new Promise(async (resolve, reject) => {
		const query = `SELECT COUNT(*) as count FROM posts WHERE user_id = ? AND bucket_id = ?;`;
		logger.info(query);
		try {
			let result = await mysql.query(request_id, db, query, [ data.user_id_added_by, data.bucket_id ]);
			if (result) {
				resolve(result[0].count);
			} else {
				reject({ code: 104, custom_message: 'No more buckets for this bucket.' });
			}
		} catch (e) {
			reject({ code: 104, message: { message: e.message, stack: e.stack } });
		}
	});
};
