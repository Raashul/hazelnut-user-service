const response = require(__base + '/app/modules/common/response');
const bot = require(__base + '/app/modules/common/telegramBot');

const addModule = require(__base + '/app/modules/ocr/add');

module.exports.generateOcr = async (req, res) => {
	try {
		const user_id = req.authInfo.user_id;
		const { image_url } = req.body;

		const ocrPayload = {
			imagePath: image_url,
			highlightType: 'NO_HIGHLIGHT'
		};
		const ocrResponse = await addModule.callOCRservice(req.request_id, ocrPayload);
		bot.send(req.request_id, `Someone tried OCR :) . - ${req.request_id}`);
		response.success(req.request_id, { ocrResponse, user_id }, res);
	} catch (e) {
		response.failure(req.request_id, e, res);
	}
};
