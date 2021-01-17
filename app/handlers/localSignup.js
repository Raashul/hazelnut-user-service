'use strict';
const uuid = require('uuid/v4');

const response = require(__base + '/app/modules/common/response');

const signup = require(__base + '/app/modules/registration/signup');
// const signUpModule = require(__base + '/app/modules/registration/signup');

const bot = require(__base + '/app/modules/common/telegramBot');

module.exports.signup = async (req, res) => {
	let user = req.body;
	try {
		await signup.initLocal(req.request_id, user);
		await signup.validation(req.request_id, user);
		await signup.checkIfEmailExists(req.request_id, user);
		let user_id = await signup.checkreferralcode(req.request_id, user);
		let hashpassword = await signup.hashpassword(req.request_id, user.password);
		user = await signup.insertIntoUsersTableLocal(req.request_id, user_id, hashpassword, user);
		const email = user.email;
		let token = await signup.generateToken(req.request_id, user);
		await signup.sendWelcomeEmail(req.request_id, { user_id, email });
		bot.send(req.request_id, `Someone signed up. - ${req.request_id}`);

		response.success(req.request_id, { token: token, user_id: user_id }, res);
	} catch (e) {
		response.failure(req.request_id, e, res);
	}
};

module.exports.adminSignup = async (req, res) => {
	const payload = req.body;
	let { email } = payload;
	try {
		if (email !== 'rashul1996@gmail.com') {
			reject({ code: 103, message: 'Invalid admin email' });
		}
		const user_id = uuid();
		payload.user_id = user_id;
		await signup.checkIfEmailExists(req.request_id, payload);
		let hashpassword = await signup.hashpassword(req.request_id, payload.password);
		let token = await signup.generateToken(req.request_id, payload);
		const user = await signup.insertIntoUsersTableLocal(req.request_id, user_id, hashpassword, payload);
		bot.send(req.request_id, `Admin signed up. - ${req.request_id}`);
		response.success(req.request_id, { token: token, user_id: payload.user_id }, res);
	} catch (e) {
		response.failure(req.request_id, e, res);
	}
};
