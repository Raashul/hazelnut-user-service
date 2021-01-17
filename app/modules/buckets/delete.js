'use strict';

const uuid = require('uuid/v4');

const mysql = require(__base + '/app/modules/common/mysql');
const logger = require(__base + '/app/modules/common/logger');

const db = 'provisioning';

module.exports.init = (request_id, data) => {
	return new Promise(async (resolve, reject) => {
		if (data.user_id !== 'undefined' && data.bucket_id !== 'undefined') {
			if (typeof data.bucket_id !== 'undefined' && typeof data.user_id !== 'undefined') {
				resolve();
			} else reject({ code: 103.1, message: 'Invalid parent attribute.' });
		} else {
			reject({ code: 103.1, message: 'Missing parent attribute.' });
		}
	});
};

module.exports.checkIfBucketExistsForUser = (request_id, data) => {
	return new Promise(async (resolve, reject) => {
		const query = `SELECT * FROM buckets WHERE bucket_id = ? AND user_id_added_by = ?;`;

		try {
			let result = await mysql.query(request_id, db, query, [ data.bucket_id, data.user_id ]);
			if (result.length === 1) resolve();
			else {
				reject({ code: 103.4, custom_message: 'No such bucket for this user.' });
			}
		} catch (e) {
			reject({ code: 102, message: { message: e.message, stack: e.stack } });
		}
	});
};

module.exports.deleteBucket = (request_id, data) => {
	return new Promise(async (resolve, reject) => {
		const { user_id, bucket_id } = data;

		const query = 'DELETE FROM buckets WHERE user_id_added_by = ? AND bucket_id = ?';

		const query_body = { bucket_id, user_id };

		try {
			let result = await mysql.query(request_id, db, query, [ query_body.user_id, query_body.bucket_id ]);
			if (result.affectedRows === 1) {
				resolve();
			} else {
				reject({ code: 103.3, message: 'Failure to delete bucket.' });
			}
		} catch (e) {
			reject({ code: 102, message: { message: e.message, stack: e.stack } });
		}
	});
};

module.exports.deletePosts = (request_id, data) => {
	return new Promise(async (resolve, reject) => {
		const { user_id, bucket_id } = data;

		const query = 'DELETE FROM posts WHERE user_id = ? AND bucket_id = ?';

		const query_body = { bucket_id, user_id };

		try {
			let result = await mysql.query(request_id, db, query, [ query_body.user_id, query_body.bucket_id ]);
			if (result.affectedRows >= 0) {
				resolve();
			} else {
				reject({ code: 103.3, message: 'Failure to delete posts.' });
			}
		} catch (e) {
			reject({ code: 102, message: { message: e.message, stack: e.stack } });
		}
	});
};

module.exports.deleteReminderConfigForBucket = (request_id, data) => {
	return new Promise(async (resolve, reject) => {
		const { user_id, bucket_id } = data;

		const query = 'DELETE FROM config_reminder WHERE user_id = ? AND bucket_id = ?';
		const query_body = { bucket_id, user_id };

		try {
			let result = await mysql.query(request_id, db, query, [ query_body.user_id, query_body.bucket_id ]);
			if (result.affectedRows >= 0) {
				resolve();
			} else {
				reject({ code: 103.3, message: 'Failure to delete reminder config.' });
			}
		} catch (e) {
			reject({ code: 102, message: { message: e.message, stack: e.stack } });
		}
	});
};

module.exports.deleteFromRemindersTable = (request_id, data) => {
	return new Promise(async (resolve, reject) => {
		const { user_id, bucket_id } = data;

		const query = 'DELETE FROM reminders WHERE user_id = ? AND bucket_id = ?';
		const query_body = { bucket_id, user_id };

		try {
			let result = await mysql.query(request_id, db, query, [ query_body.user_id, query_body.bucket_id ]);
			if (result.affectedRows >= 0) {
				resolve();
			} else {
				reject({ code: 103.3, message: 'Failure to delete reminders.' });
			}
		} catch (e) {
			reject({ code: 102, message: { message: e.message, stack: e.stack } });
		}
	});
};

module.exports.deleteReminderConfigForChild = (request_id, data) => {
	return new Promise(async (resolve, reject) => {
		const { user_id, childBucketId } = data;
		const query = 'DELETE FROM config_reminder WHERE user_id = ? AND bucket_id = ?';
		const query_body = { childBucketId, user_id };

		try {
			let result = await mysql.query(request_id, db, query, [ query_body.user_id, query_body.childBucketId ]);
			if (result.affectedRows >= 0) {
				resolve();
			} else {
				reject({ code: 103.3, message: 'Failure to delete reminder config.' });
			}
		} catch (e) {
			reject({ code: 102, message: { message: e.message, stack: e.stack } });
		}
	});
};

module.exports.deleteFromRemindersTableForChild = (request_id, data) => {
	return new Promise(async (resolve, reject) => {
		const { user_id, childBucketId } = data;

		const query = 'DELETE FROM reminders WHERE user_id = ? AND bucket_id = ?';
		const query_body = { childBucketId, user_id };

		try {
			let result = await mysql.query(request_id, db, query, [ query_body.user_id, query_body.childBucketId ]);
			if (result.affectedRows >= 0) {
				resolve();
			} else {
				reject({ code: 103.3, message: 'Failure to delete reminders.' });
			}
		} catch (e) {
			reject({ code: 102, message: { message: e.message, stack: e.stack } });
		}
	});
};

module.exports.deleteChildBucketsIfAny = (request_id, data) => {
	return new Promise(async (resolve, reject) => {
		const { user_id, bucket_id } = data;
		const query = 'UPDATE buckets SET soft_deleted = ? WHERE user_id_added_by = ? AND parent_bucket_id = ?';

		const query_body = { bucket_id, user_id };

		try {
			let result = await mysql.query(request_id, db, query, [ 1, query_body.user_id, query_body.bucket_id ]);
			if (result.affectedRows >= 0) {
				resolve();
			} else {
				reject({ code: 103.3, message: 'Failure to delete child bucket.' });
			}
		} catch (e) {
			reject({ code: 102, message: { message: e.message, stack: e.stack } });
		}
	});
};
