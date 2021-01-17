'use strict';

const uuid = require('uuid/v4');
const validator = require('validator');

const mysql = require(__base + '/app/modules/common/mysql');
const logger = require(__base + '/app/modules/common/logger');
const thumbnails = require(__base + '/app/modules/common/thumbnail');

//create single image upload instance for multer
const singleUpload = thumbnails.single('image');

const db = 'provisioning';

module.exports.insertThumbnailImageIntoS3Bucket = (request_id, req, res) => {
  return new Promise(async (resolve, reject) => {
    try {
      logger.info('inserting into thumbnail');
      req.temp.typeOfImage = 'thumbnail'
      singleUpload(req, res, async (err, some) => {
      
        if (err) {
          logger.error(err);
          reject({ code: 103.3, message: 'Failure to insert photo.' });
        } else if (req.temp.fileValidationError) {
          reject({ code: 103.3, custom_message: 'Incorrect file format.' });
        } else {
          resolve();
        }
      });
    } catch (e) {
      reject({ code: 103, message: { message: e.message, stack: e.stack } });
    }
  });
}