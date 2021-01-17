'use strict';

// const health = require(__base + '/app/handlers/health')
const logger = require(__base + '/app/modules/common/logger');
const route = require(__base + '/app/routes/config/constants');
const health = require(__base + '/app/handlers/health');

const home = require(__base + '/app/handlers/home');
const posts = require(__base + '/app/handlers/posts');
const buckets = require(__base + '/app/handlers/buckets');
const reminders = require(__base + '/app/handlers/reminders');
const localSignUp = require(__base + '/app/handlers/localSignup');
const user = require(__base + '/app/handlers/user');
const login = require(__base + '/app/handlers/login');
const notification = require(__base + '/app/handlers/notification');
const feedback = require(__base + '/app/handlers/feedback');
const authorization = require(__base + '/app/routes/config/authorization');
const password = require(__base + '/app/handlers/password');
const subscribe = require(__base + '/app/handlers/subscribe');
const search = require(__base + '/app/handlers/search');

const ocrHandler = require(__base + '/app/handlers/ocr');

exports = module.exports = (app) => {
	//health checks
	app.get('/', health.check);
	app.get('/health', health.check);

	// app.get('/', (req, res) => res.send('this is working..... :) '));

	// local registration
	app.route(route.localSignup).post(localSignUp.signup);

	// local login
	app.route(route.login).post(login.login);

	//home route
	app.get(route.home, authorization.authCheck, home.info);

	app.route(route.defaultBucket).post(authorization.authCheck, buckets.addDefaultBuckets);

	//Post route
	app
		.route(route.post)
		.get(authorization.authCheck, posts.info)
		.put(authorization.authCheck, posts.edit)
		.delete(authorization.authCheck, posts.delete);

	//get posts inside child bucket
	app.route(route.postInsideBucket).get(authorization.authCheck, posts.postsInsideBucket);

	//add post with image
	app.route(route.addPostWithImage).post(authorization.authCheck, posts.addWithImage);

	//add post with text
	app.route(route.addPostWithText).post(authorization.authCheck, posts.addWithText);

	//get user information
	app.route(route.user).get(authorization.authCheck, user.info);

	//bucket routes
	app
		.route(route.bucket)
		.get(authorization.authCheck, buckets.get)
		.post(authorization.authCheck, buckets.add)
		.put(authorization.authCheck, buckets.edit)
		.delete(authorization.authCheck, buckets.delete);

	//get child buckets
	app.route(route.childBuckets).get(authorization.authCheck, buckets.getChildBuckets);

	//get all buckets by type
	app.route(route.bucketByType).get(authorization.authCheck, buckets.getBucketsByType);

	//Reminder routes

	//Specific reminder routes
	app.route(route.specificReminder).post(authorization.authCheck, reminders.addSpecificReminder);

	//general reminder
	app.route(route.generalReminder).post(authorization.authCheck, reminders.addGeneralReminder);

	//daily reminders
	app.route(route.dailyReminder).post(authorization.authCheck, reminders.addDailyReminder);

	app
		.route(route.reminders)
		.put(authorization.authCheck, reminders.editReminders)
		.get(authorization.authCheck, reminders.getAllReminders)
		.delete(authorization.authCheck, reminders.deleteReminders);

	//notification route
	app.route(route.notification).get(authorization.authCheck, notification.info);

	// logger.info(`Routes initialized.`)

	// Feedback route
	app.route(route.feedback).post(authorization.authCheck, feedback.insertFeedback);

	// get a new password
	app.route(route.password).post(password.getCode);
	// Validate the password code
	app.route(route.password).get(password.validateCode);
	// Update the password with the new password
	app.route(route.password).put(password.updatePassword);

	//pin buckets
	app.route(route.pinBuckets).put(authorization.authCheck, buckets.pinBuckets);

	//pin buckets
	app.route(route.unpinBuckets).put(authorization.authCheck, buckets.unpinBuckets);

	//subscribe to buckets
	app
		.route(route.subscribeBuckets)
		.get(authorization.authCheck, subscribe.listSubscribedBuckets)
		.post(subscribe.subscribeBucket);

	app.route(route.postsFromSubscribedBuckets).get(authorization.authCheck, posts.getPostsFromSubscribedBuckets);

	app.route(route.subscribedSubBuckets).get(authorization.authCheck, subscribe.listOfSubBuckets);

	//unsubscribe to bucket
	app.route(route.unsubscribeBucket).delete(authorization.authCheck, subscribe.unsubscribeBucket);

	//search route
	app.route(route.search).get(authorization.authCheck, search.getBuckets);

	app.route(route.searchAvailableChildBuckets).get(authorization.authCheck, search.searchAvailableChildBucket);

	app.route(route.adminSignup).post(localSignUp.adminSignup);

	//images
	app.route(route.images).get(authorization.authCheck, posts.getImagesForUser);

	//ocr
	app.route(route.ocr).post(authorization.authCheck, ocrHandler.generateOcr);

	//ocr save
	app.route(route.saveOcr).post(authorization.authCheck, posts.saveOcrResponsetoBucket);

	logger.info(`Routes initialized.`);
};
