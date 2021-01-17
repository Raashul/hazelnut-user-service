'use strict';

const response = require(__base + '/app/modules/common/response');
const logger = require(__base + '/app/modules/common/logger');
const searchModule = require(__base + '/app/modules/search/info');

module.exports.getBuckets = async(req, res) => {
    const user_id = req.authInfo.user_id;
    const {bucket_name} = req.query;
    try{
        let payload = {user_id};
        let request_body = {user_id, bucket_name};
        let response_body = {bucket_name};

        await searchModule.checkIfBucketExists(req.request_id, payload);
        
        const parent_buckets = await searchModule.findSimilarParentBuckets(req.request_id, request_body);
        const child_buckets = await searchModule.findSimilarChildBuckets(req.request_id, request_body);

        response_body.parent_buckets = parent_buckets;
        response_body.child_buckets = child_buckets;

        response.success(req.request_body, response_body, res);
    } catch(e){
        response.failure(req.request_id, e, res);
    }
}

module.exports.searchAvailableChildBucket = async (req, res) => {
    const user_id = req.authInfo.user_id;
    const {bucket_name} = req.query;
    try{
        let payload = {user_id};
        let request_body = {user_id, bucket_name};
        let response_body = {bucket_name};

        await searchModule.checkIfBucketExists(req.request_id, payload);
        const child_buckets = await searchModule.findSimilarChildBuckets(req.request_id, request_body);

        response_body.buckets = child_buckets;

        response.success(req.request_body, response_body, res);
    } catch(e){
        response.failure(req.request_id, e, res);
    }
}