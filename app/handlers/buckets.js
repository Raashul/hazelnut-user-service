'use strict';

const response = require(__base + '/app/modules/common/response');
const logger = require(__base + '/app/modules/common/logger');

const addModule = require(__base + '/app/modules/buckets/add');
const infoModule = require(__base + '/app/modules/buckets/info');
const editModule = require(__base + '/app/modules/buckets/edit');
const deleteModule = require(__base + '/app/modules/buckets/delete');
const pinModule = require(__base + '/app/modules/buckets/pin');

const bot = require(__base + '/app/modules/common/telegramBot');

//generate  buckets
module.exports.add = async (req, res) => {
	try {
		const body = req.body;
		const user_id = req.authInfo.user_id;
		let response_body = req.body;
		response_body.user_id = user_id;

		await addModule.init(req.request_id, response_body);
		await addModule.validation(req.request_id, response_body);
		// await addModule.checkIfBucketAlreadyExists(req.request_id, response_body);
		const bucket_id = await addModule.insertIntoBucketsTable(req.request_id, response_body);
		response_body.bucket_id = bucket_id;

		bot.send(req.request_id, `Someone added a bucket - ${req.request_id}`);

		response.success(req.request_id, response_body, res);
	} catch (e) {
		response.failure(req.request_id, e, res);
	}
};

//generate deafault buckets
module.exports.addDefaultBuckets = async (req, res) => {
	try {
		const body = req.body;
		const user_id = req.authInfo.user_id;
		let response_body = req.body;
		response_body.user_id = user_id;

		Promise.all(
			response_body.map(async (data) => {
				data.type = 'child';
				data.template = 'post';
				data.user_id = user_id;
				await addModule.init(req.request_id, data);
				await addModule.validation(req.request_id, data);
				await addModule.checkIfBucketAlreadyExists(req.request_id, data);
				await addModule.insertIntoBucketsTable(req.request_id, data);
			})
		).then(() => {
			response.success(req.request_id, response_body, res);
		});
	} catch (e) {
		response.failure(req.request_id, e, res);
	}
};

module.exports.get = async (req, res) => {
	try {
		const bucket_id = req.query.id;
		const user_id = req.authInfo.user_id;
		let response_body = {
			bucket_id,
			user_id
		};

		await infoModule.validation(req.request_id, response_body);
		//await infoModule.checkIfBucketExists(req.request_id, response_body);
		const buckets = await infoModule.getSecondaryBucketsIfExists(req.request_id, response_body);
		//get type of reminder
		// const reminders = await infoModule.getRemindersIfExists(req.request_id, response_body);
		Promise.all(
			buckets.map(async function(bucket) {
				let bucketId = bucket.bucket_id;
				//get type of reminder
				const reminders = await infoModule.getRemindersIfExists(req.request_id, bucket);
				bucket.reminder_type = reminders != null ? reminders.type : null;
				bucket.reminder_time_of_day = reminders != null ? reminders.time_of_day : null;

				const count = await infoModule.checkCountForBucketPost(req.request_id, { bucketId, user_id });
				bucket.number_of_posts = count;
			})
		).then(function() {
			response_body.buckets = buckets;
			// if(reminders != null) {
			//   response_body.reminder_type = reminders.type;
			// } else{
			//   response_body.reminder_type = null;
			// }
			response.success(req.request_id, response_body, res);
		});
	} catch (e) {
		response.failure(req.request_id, e, res);
	}
};

module.exports.edit = async (req, res) => {
	try {
		const user_id = req.authInfo.user_id;
		// const { bucket_id, bucket_name, cover_image } = req.body;
		const payload = req.body;
		payload.user_id = user_id;

		await editModule.init(req.request_id, payload);
		await editModule.validation(req.request_id, payload);
		await editModule.checkIfBucketExists(req.request_id, payload);
		const response_body = await editModule.editBucket(req.request_id, payload);

		response.success(req.request_id, { payload }, res);
	} catch (e) {
		response.failure(req.request_id, e, res);
	}
};

module.exports.delete = async (req, res) => {
	try {
		const user_id = req.authInfo.user_id;
		const { buckets } = req.body;
		let response_body = [];
		for (let i = 0; i < buckets.length; i++) {
			const bucket_id = buckets[i].bucket_id;
			const payload = { bucket_id, user_id };
			response_body.push(payload);
			await deleteModule.init(req.request_id, payload);
			await deleteModule.checkIfBucketExistsForUser(req.request_id, payload);
			// await deleteModule.deleteFromRemindersTable(req.request_id, payload);
			// await deleteModule.deleteReminderConfigForBucket(req.request_id, payload);
			await deleteModule.deletePosts(req.request_id, payload);
			await deleteModule.deleteBucket(req.request_id, payload);
			await deleteModule.deleteChildBucketsIfAny(req.request_id, payload);
		}

		response.success(req.request_id, { response_body }, res);
	} catch (e) {
		response.failure(req.request_id, e, res);
	}
};

//get child bucket
module.exports.getChildBuckets = async (req, res) => {
	try {
		const user_id = req.authInfo.user_id;
		let response_body = {
			user_id,
			type: 'child'
		};

		//await infoModule.checkIfBucketExists(req.request_id, response_body);
		const buckets = await infoModule.getAllChildBuckets(req.request_id, response_body);
		response.success(req.request_id, { buckets }, res);
	} catch (e) {
		response.failure(req.request_id, e, res);
	}
};

//get all buckets by type
module.exports.getBucketsByType = async (req, res) => {
	try {
		const user_id = req.authInfo.user_id;
		let response_body = {
			user_id
		};

		const parent_buckets = await infoModule.getAllParentBuckets(req.request_id, response_body);
		const child_buckets = await infoModule.getAllChildBuckets(req.request_id, response_body);
		response_body.parent_buckets = parent_buckets;
		response_body.child_buckets = child_buckets;

		response.success(req.request_id, response_body, res);
	} catch (e) {
		response.failure(req.request_id, e, res);
	}
};

module.exports.pinBuckets = async (req, res) => {
	try {
		const body = req.body;
		const user_id = req.authInfo.user_id;
		let response_body = req.body;
		response_body.user_id = user_id;

		const { buckets } = response_body;

		Promise.all(
			buckets.map(async function(bucket) {
				const payload = {
					bucket_id: bucket.bucket_id,
					user_id: user_id
				};

				await pinModule.init(req.request_id, payload);
				await pinModule.checkIfBucketAlreadyExists(req.request_id, payload);
				await pinModule.updateBucketsTable(req.request_id, payload);
			})
		).then(function() {
			bot.send(req.request_id, `Someone pinned a buckets ${req.request_id}`);
			response_body.buckets = buckets;
			response.success(req.request_id, response_body, res);
		});
	} catch (e) {
		response.failure(req.request_id, e, res);
	}
};

module.exports.unpinBuckets = async (req, res) => {
	try {
		const body = req.body;
		const user_id = req.authInfo.user_id;
		let response_body = req.body;
		response_body.user_id = user_id;

		const { buckets } = response_body;

		Promise.all(
			buckets.map(async function(bucket) {
				const payload = {
					bucket_id: bucket.bucket_id,
					user_id: user_id
				};

				await pinModule.init(req.request_id, payload);
				await pinModule.checkIfBucketAlreadyExists(req.request_id, payload);
				await pinModule.unpinBuckets(req.request_id, payload);
			})
		).then(function() {
			bot.send(req.request_id, `Someone unpinned a buckets ${req.request_id}`);
			response_body.buckets = buckets;
			response.success(req.request_id, response_body, res);
		});
	} catch (e) {
		response.failure(req.request_id, e, res);
	}
};
