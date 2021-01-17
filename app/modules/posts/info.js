'use strict';

const validator = require('validator');
const mysql = require(__base + '/app/modules/common/mysql');
const logger = require(__base + '/app/modules/common/logger');

const db = 'provisioning';

module.exports.validation = (request_id, response_body) => {
	return new Promise((resolve, reject) => {
		if (validator.isUUID(response_body.user_id)) {
			logger.info(request_id, response_body.user_id);
			resolve();
		} else {
			reject({ code: 103, message: 'Attributes validation incorrect. Not UUID' });
		}
	});
};

module.exports.postInsideBucketValidation = (request_id, response_body) => {
	const { user_id, bucket_id } = response_body;
	return new Promise((resolve, reject) => {
		if (validator.isUUID(response_body.user_id)) {
			logger.info(request_id, response_body.user_id);
			if (bucket_id != 'undefined') resolve();
		} else {
			reject({ code: 103, custom_message: 'Missing parent attribute' });
		}
	});
};

module.exports.checkIfBucketIsSubscribed = (request_id, data) => {
	return new Promise(async (resolve, reject) => {
		const query = `SELECT * FROM subscription_buckets WHERE bucket_id = ? AND user_id = ?;`;
		try {
			let result = await mysql.query(request_id, db, query, [ data.bucket_id, data.user_id ]);
			if (result.length > 0) {
				resolve(result[0].user_id_added_by);
			} else {
				reject({
					code: 103,
					custom_message: 'No bucket with that bucket_id for this user.'
				});
			}
		} catch (e) {
			reject({ code: 103, message: { message: e.message, stack: e.stack } });
		}
	});
};

module.exports.getBucketAdminUserId = (request_id, data) => {
	return new Promise(async (resolve, reject) => {
		const query = `SELECT user_id_added_by FROM buckets WHERE bucket_id = ? AND soft_deleted = 0;`;
		try {
			let result = await mysql.query(request_id, db, query, [ data.bucket_id ]);
			if (result.length > 0) {
				resolve(result[0].user_id_added_by);
			} else {
				reject({
					code: 103,
					custom_message: 'No bucket with that bucket_id for this user.'
				});
			}
		} catch (e) {
			reject({ code: 103, message: { message: e.message, stack: e.stack } });
		}
	});
};

module.exports.details = (request_id, user_id) => {
	return new Promise(async (resolve, reject) => {
		const query = `SELECT * FROM users WHERE user_id = ?;`;
		try {
			let result = await mysql.query(request_id, db, query, [ user_id ]);

			if (result.length === 1) {
				resolve(result[0]);
			} else {
				reject({ code: 103, custom_message: 'Issue with user.' });
			}
		} catch (e) {
			reject({ code: 103, message: { message: e.message, stack: e.stack } });
		}
	});
};

module.exports.postDetails = (request_id, response_body) => {
	return new Promise(async (resolve, reject) => {
		const query = `SELECT * FROM posts WHERE post_id = ?;`;
		try {
			let result = await mysql.query(request_id, db, query, [ response_body.post_id ]);

			if (result.length === 1) {
				resolve(result[0]);
			} else {
				reject({ code: 103, custom_message: 'No post with that id.' });
			}
		} catch (e) {
			reject({ code: 103, message: { message: e.message, stack: e.stack } });
		}
	});
};

module.exports.getPostsForBucket = (request_id, response_body) => {
	return new Promise(async (resolve, reject) => {
		const { user_id, bucket_id } = response_body;
		console.log(response_body);
		const query = `SELECT * FROM posts WHERE bucket_id = ? AND user_id = ? AND soft_deleted = ? ORDER BY created_at DESC;;`;
		try {
			let result = await mysql.query(request_id, db, query, [ bucket_id, user_id, 0 ]);

			if (result.length >= 0) {
				resolve(result);
			} else {
				reject({ code: 103, custom_message: 'Some issue with this user' });
			}
		} catch (e) {
			reject({ code: 103, message: { message: e.message, stack: e.stack } });
		}
	});
};

module.exports.getImagesFromUser = (request_id, response_body) => {
	return new Promise(async (resolve, reject) => {
		const { user_id } = response_body;
		const query = `SELECT * FROM images WHERE user_id = ?`;
		try {
			let result = await mysql.query(request_id, db, query, [ user_id ]);

			if (result.length >= 0) {
				resolve(result);
			} else {
				reject({ code: 103, custom_message: 'Some issue with this user' });
			}
		} catch (e) {
			reject({ code: 103, message: { message: e.message, stack: e.stack } });
		}
	});
};

//get number of reminders sent for each post
module.exports.getRemindersCount = (request_id, response_body) => {
	return new Promise(async (resolve, reject) => {
		const { user_id, post_id } = response_body;
		const query = `SELECT COUNT(*) as count FROM reminders WHERE post_id = ? AND user_id = ? AND status = ?;`;
		try {
			let result = await mysql.query(request_id, db, query, [ post_id, user_id, 'SENT' ]);
			logger.info('number', result);
			if (result.length > 0) {
				resolve(result[0].count);
			} else {
				reject({ code: 103, custom_message: 'Some issue when getting reminder count' });
			}
		} catch (e) {
			reject({ code: 103, message: { message: e.message, stack: e.stack } });
		}
	});
};
