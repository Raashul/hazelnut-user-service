const feedback = require(__base + '/app/modules/feedback/insertfeed');
const response = require(__base + '/app/modules/common/response');

const bot = require(__base + '/app/modules/common/telegramBot');


module.exports.insertFeedback = async (req, res) => {
  const payload = req.body;
  try {
    await feedback.addfeed(req.request_id, req.authInfo.user_id, payload);
    bot.send(req.request_id, `Someone added a feedback. -${payload.feedback} - - ${req.request_id}`);
    response.success(req.request_id,{ message: 'Thank you for your time and response' },res);
  } catch (e) {
    response.failure(req.request_id, e, res);
  }
};
