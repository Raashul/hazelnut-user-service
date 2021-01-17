'use strict';

const routes = {
	localSignup: '/api/local/signup',
	login: '/api/local/login',
	home: '/api/home',
	bucket: '/api/bucket',
	defaultBucket: '/api/bucket/default',
	childBuckets: '/api/buckets/child',
	bucketByType: '/api/buckets/type',
	postInsideBucket: '/api/posts/bucket',
	post: '/api/post',
	addPostWithText: '/api/post/add/text',
	addPostWithImage: '/api/post/add/image',
	add: '/api/add',
	user: '/api/user',
	reminders: '/api/reminders',
	specificReminder: '/api/reminder/specific',
	dailyReminder: '/api/reminder/daily',
	generalReminder: '/api/reminder/general',
	notification: '/api/notification',
	feedback: '/api/feedback',
	password: '/api/password',
	pinBuckets: '/api/buckets/pin',
	unpinBuckets: '/api/buckets/unpin',
	subscribeBuckets: '/api/bucket/subscribe',
	subscribedSubBuckets: '/api/bucket/subscribe/child',
	postsFromSubscribedBuckets: '/api/bucket/subscribe/post',
	unsubscribeBucket: '/api/bucket/unsubscribe',
	search: '/api/bucket/search',
	searchAvailableChildBuckets: '/api/bucket/child/search',

	ocr: '/api/ocr',
	adminSignup: '/api/admin/signup',
	images: '/api/images',
	saveOcr: '/api/ocr/save'
};

module.exports = routes;
