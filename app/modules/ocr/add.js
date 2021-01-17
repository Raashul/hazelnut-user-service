'use strict';

const uuid = require('uuid/v4');
const axios = require('axios');
const config = require(__base + '/app/config/config');

const logger = require(__base + '/app/modules/common/logger');

module.exports.callOCRservice = (request_id, data) => {
	const { ocr } = config.services;
	return new Promise((resolve, reject) => {
		axios
			.post(ocr, data)
			.then((response) => {
				if (response.data.msg === 'Process Ok.') {
					resolve(response.data.hazelResult.blocks);
				} else {
					reject({ code: 103.3, custom_message: 'Errow while ocr.' });
				}
			})
			.catch((e) => {
				reject({ code: 103, message: { message: e.message, stack: e.stack } });
			});
	});
};
