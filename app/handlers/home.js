'use strict';

const response = require(__base + '/app/modules/common/response');
const logger = require(__base + '/app/modules/common/logger');

const infoModule = require(__base + '/app/modules/home/info');

module.exports.info = async (req, res) => {
	try {
		const user_id = req.authInfo.user_id;
		let payload = {
			user_id
		};
		let response_body = {};

		await infoModule.validation(req.request_id, payload);
		const buckets = await infoModule.checkParentBucketsForThatUser(req.request_id, payload);

		//get count of child buckets
		Promise.all(
			buckets.map(async (bucket) => {
				const countOfChildBuckets = await infoModule.numberOfChildBuckets(req.request_id, bucket);
				bucket.number_of_child_buckets = countOfChildBuckets;
				// bucket.number_of_child_buckets = 0;

				const countOfPosts = await infoModule.numberOfPosts(req.request_id, bucket);
				bucket.number_of_posts = countOfPosts;
			})
		).then(() => {
			response_body.buckets = buckets;
			response.success(req.request_id, response_body, res);
		});
	} catch (e) {
		response.failure(req.request_id, e, res);
	}
};
