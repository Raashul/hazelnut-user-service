const password = require(__base + '/app/modules/registration/password');
const response = require(__base + '/app/modules/common/response');
const signup = require(__base + '/app/modules/registration/signup');
const login = require(__base + '/app/modules/registration/login');

module.exports.getCode = async (req, res) => {
  const { email } = req.body;
  try {
    await password.validation(req.request_id, email);
    await login.checkUserExist(req.request_id, email);
    let new_code = await password.generateCode();
    await password.sendEmail(req.request_id, email, new_code);
    // Soft delete all the previous code
    await password.softDelete(req.request_id, email);
    await password.insertIntoTable(req.request_id, email, new_code);
    response.success(req.request_id, { message: 'Email sent' }, res);
  } catch (e) {
    response.failure(req.request_id, e, res);
  }
};

module.exports.validateCode = async (req, res) => {
  const { email, code } = req.query;
  try {
    await password.validateCode(req.request_id, code);
    let data = await password.checkTable(req.request_id, email, code);
    await password.checkExpiry(req.request_id, data.id, data.created_at);
    response.success(req.request_id, { custom_message: 'Validated' }, res);
  } catch (e) {
    response.failure(req.request_id, e, res);
  }
};

module.exports.updatePassword = async (req, res) => {
  const { email, code, new_password } = req.body;
  try {
    let data = await password.checkTable(req.request_id, email, code);
    await password.checkExpiry(req.request_id, data.id, data.created_at);
    let hash_password = await signup.hashpassword(req.request_id, new_password);
    await password.updateUserTable(req.request_id, email, hash_password);
    await password.softDelete(req.request_id, email);
    response.success(
      req.request_id,
      {
        message: 'Your password has been updated'
      },
      res
    );
  } catch (e) {
    response.failure(req.request_id, e, res);
  }
};
