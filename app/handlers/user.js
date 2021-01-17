'use strict';

const response = require(__base + '/app/modules/common/response');
const infoModule = require(__base + '/app/modules/user/info');

module.exports.info = async (req, res) => {
  try {
    const user_id = req.authInfo.user_id;
    const payload = {
      user_id
    }
    await infoModule.validation(req.request_id, payload);
    const response_body = await infoModule.getUserInformation(req.request_id, payload);

    response.success(req.request_id, response_body, res);

  } catch(e) {
    response.failure(req.request_id, e, res);
  }
}





