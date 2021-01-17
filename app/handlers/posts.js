'use strict';

const response = require(__base + '/app/modules/common/response');
const logger = require(__base + '/app/modules/common/logger');

const uuid = require('uuid/v4');
const multiparty = require('multiparty');

const infoModule = require(__base + '/app/modules/posts/info');
const postAddModule = require(__base + '/app/modules/posts/add');
const editPostModule = require(__base + '/app/modules/posts/edit');
const deletePostModule = require(__base + '/app/modules/posts/delete');
// const thumbnailModule = require(__base + '/app/modules/posts/thumbnail');

const bot = require(__base + '/app/modules/common/telegramBot');

const getImage = require(__base + '/app/modules/common/getImage');

module.exports.info = async (req, res) => {
	try {
		let body = req.query;
		let user_id = req.authInfo.user_id;

		let response_body = body;
		response_body.user_id = user_id;

		await infoModule.validation(req.request_id, response_body);
		await infoModule.postDetails(req.request_id, response_body);
		response.success(req.request_id, post, res);
	} catch (e) {
		response.failure(req.request_id, e, res);
	}
};

//get list of posts inside child bucket
module.exports.postsInsideBucket = async (req, res) => {
	try {
		const user_id = req.authInfo.user_id;
		const bucket_id = req.query.id;
		const response_body = { user_id, bucket_id };

		await infoModule.postInsideBucketValidation(req.request_id, response_body);
		await postAddModule.checkIfBucketExists(req.request_id, response_body);
		const posts = await infoModule.getPostsForBucket(req.request_id, response_body);

		response_body.posts = posts;
		for (let i = 0; i < posts.length; i++) {
			let post_id = posts[i].post_id;
			let content = posts[i].content;
			const reminders = await infoModule.getRemindersCount(req.request_id, { post_id, user_id });
			response_body.posts[i].reminders_sent = reminders;
			if (posts[i].type === 'image') {
				let image_urls = await getImage.getImageForPost({ user_id, post_id, content });
				response_body.posts[i].image_urls = image_urls;
			}
		}

		delete req.temp; //remove any temp value set {post_id, fileValidationError}
		response.success(req.request_id, response_body, res);
	} catch (e) {
		response.failure(req.request_id, e, res);
	}
};

module.exports.addWithImage = async (req, res) => {
	try {
		const user_id = req.authInfo.user_id;
		const bucket_id = req.query.id;
		const post_id = uuid();
		// const description = req.body;

		const payload = { user_id, post_id };

		req.temp = { post_id, bucket_id };
		//get file name from s3 (file name is `timestamp-fileOriginalName`)

		// payload.content = post_id; //content of image post will be the post_id
		// await postAddModule.validation(req.request_id, payload);
		// await postAddModule.imageValidation(req.request_id, payload);

		await postAddModule.insertImageIntoS3Bucket(req.request_id, req, res);
		// const image_url_from_s3 = await getImage.getImageForOcrProcessing(payload);
		// await thumbnailModule.insertThumbnailImageIntoS3Bucket(req.request_id, req, res);

		const ext = req.temp.file_extension;
		// payload.file_ext = ext;

		const image_url_for_ocr = `https://hazelnut-images.s3.us-east-2.amazonaws.com/ocr/${bucket_id}/${post_id}`;
		payload.image_url = image_url_for_ocr;
		await postAddModule.insertIntoImageTable(req.request_id, payload);

		// const ocrPayload = {
		// 	imagePath: image_url_for_ocr,
		// 	highlightType: 'NO_HIGHLIGHT'
		// };
		// const ocrResponse = await postAddModule.callOCRservice(req.request_id, ocrPayload);
		// postAddModule.deleteImageFromS3Bucket(req.request_id, { user_id, post_id, ext });

		delete req.temp; //remove any temp value set {post_id, fileValidationError}

		// bot.send(req.request_id, `Someone added an image post. - ${req.request_id}`);
		response.success(req.request_id, { image_url_for_ocr }, res);

		// response.success(req.request_id, { image_url_for_ocr, ocrResponse }, res);
	} catch (e) {
		response.failure(req.request_id, e, res);
	}
};

module.exports.addWithText = async (req, res) => {
	try {
		const user_id = req.authInfo.user_id;
		let response_body = req.body;
		response_body.user_id = user_id;
		const { type, bucket_id, content } = response_body;

		const payload = {
			user_id,
			content,
			type,
			bucket_id
		};

		await postAddModule.init(req.request_id, payload);
		await postAddModule.validation(req.request_id, payload);
		await postAddModule.checkIfBucketExists(req.request_id, payload);

		const post_id = await postAddModule.insertIntoPostsTableContainingText(req.request_id, payload);
		bot.send(req.request_id, `Someone added a text post. - ${req.request_id}`);
		response.success(req.request_id, { post_id }, res);
	} catch (e) {
		response.failure(req.request_id, e, res);
	}
};

//edits post created by image
module.exports.edit = async (req, res) => {
	try {
		let user_id = req.authInfo.user_id;
		let response_body = req.body;
		response_body.user_id = user_id;

		const { type, content, description, bucket_id, post_id } = response_body;

		await editPostModule.validation(req.request_id, response_body);
		await editPostModule.checkIfUserExists(req.request_id, user_id);
		await editPostModule.checkIfPostExistsForThatUser(req.request_id, response_body);

		//edit posts table
		await editPostModule.editPostsTable(req.request_id, response_body);

		//success
		response.success(req.request_id, { post_id }, res);
	} catch (e) {
		response.failure(req.request_id, e, res);
	}
};

//delete post for user
module.exports.delete = async (req, res) => {
	try {
		const user_id = req.authInfo.user_id;
		const { bucket_id, post_id } = req.body;

		const payload = {
			post_id,
			user_id
		};

		await deletePostModule.validation(req.request_id, payload);
		await deletePostModule.checkIfUserExists(req.request_id, user_id);
		await deletePostModule.checkIfPostExistsForThatUser(req.request_id, payload);

		// delete row: flip to soft delete
		await deletePostModule.removeFromPostTable(req.request_id, payload);
		bot.send(req.request_id, `Someone deleted a post. - ${req.request_id}`);
		//success
		response.success(req.request_id, { post_id }, res);
	} catch (e) {
		response.failure(req.request_id, e, res);
	}
};

module.exports.getPostsFromSubscribedBuckets = async (req, res) => {
	try {
		const user_id = req.authInfo.user_id; //who is logged in
		const bucket_id = req.query.id;
		const body = {
			bucket_id
		};

		let response_body = {};

		// await infoModule.checkIfBucketIsPublic(req.request_id, body);

		//check if bucket is subscribed
		// await infoModule.checkIfBucketIsSubscribed(req.request_id, {bucket_id, user_id});
		const bucket_admin_user_id = await infoModule.getBucketAdminUserId(req.request_id, body);
		body.user_id = bucket_admin_user_id;
		const posts = await infoModule.getPostsForBucket(req.request_id, body);
		response_body.posts = posts;

		for (let i = 0; i < posts.length; i++) {
			let post_id = posts[i].post_id;
			let content = posts[i].content;
			if (posts[i].type === 'image') {
				let image_urls = await getImage.getImageForPost({ user_id: bucket_admin_user_id, post_id, content });
				response_body.posts[i].image_urls = image_urls;
			}
		}

		response_body.user_id = user_id;
		response_body.bucket_id = bucket_id;
		response.success(req.request_id, response_body, res);
	} catch (e) {
		response.failure(req.request_id, e, res);
	}
};

module.exports.getImagesForUser = async (req, res) => {
	try {
		const user_id = req.authInfo.user_id;
		const response_body = {};
		const images = await infoModule.getImagesFromUser(req.request_id, { user_id });
		response_body.images = images;
		response.success(req.request_id, response_body, res);
	} catch (e) {
		response.failure(req.request_id, e, res);
	}
};

module.exports.saveOcrResponsetoBucket = async (req, res) => {
	try {
		const user_id = req.authInfo.user_id;
		const body = req.body;
		const { type, bucket_id, content, post_id } = body;

		const payload = {
			user_id,
			content,
			type,
			bucket_id,
			post_id
		};

		payload.image_url = `https://hazelnut-images.s3.us-east-2.amazonaws.com/ocr/${bucket_id}/${post_id}`;

		await postAddModule.init(req.request_id, payload);
		await postAddModule.validation(req.request_id, payload);
		await postAddModule.checkIfBucketExists(req.request_id, payload);

		await postAddModule.insertIntoPostsTableContainingText(req.request_id, payload);

		postAddModule.deleteImageFromS3Bucket(req.request_id, { user_id, bucket_id, post_id, ext: 'jpeg' });
		await postAddModule.removeFromImagesTable(req.request_id, payload);

		response.success(req.request_id, payload, res);
	} catch (e) {
		response.failure(req.request_id, e, res);
	}
};
