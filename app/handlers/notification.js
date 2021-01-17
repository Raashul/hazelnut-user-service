'use strict';

const response = require(__base + '/app/modules/common/response');

const infoModule = require(__base + '/app/modules/notification/info');

module.exports.info = async (req, res) => {
  try {
    const user_id = req.authInfo.user_id;
    let body = {user_id};
    let response_body = {};
   

    await infoModule.init(req.request_id, body);
    const notification = await infoModule.getListOfEmailsSent(req.request_id, body);
    response_body.notification = notification;
    response.success(req.request_id, response_body, res);
  } catch(e) {
    response.failure(req.request_id, e, res);
  }
}