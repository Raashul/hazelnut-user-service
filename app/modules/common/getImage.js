const aws = require('aws-sdk');

const s3 = require(__base + '/app/init/aws').getS3();
const config = require(__base + '/app/config/config');


module.exports.getImageForOcrProcessing = data => {
  return new Promise(async (resolve, reject) => {
    const { post_id, user_id, bucket_id } = data;
    const params = {
      Bucket: config.aws.s3.postImageBucket,
      Key: `ocr/${user_id}/${post_id}`
    };
    try {
      s3.getSignedUrl('getObject', params, function(err, url){
        if(err) {
          console.log(err);
          reject({ code: 103, custom_message: 'Some issue with this user' })
        }
        else {
         resolve(url);
        }
      });
    } catch(e) {
      reject({ code: 103, message: { message: e.message, stack: e.stack } });
    }

  })
}



module.exports.getImageForPost = (data) => {
  return new Promise(async (resolve, reject) => {
    const { post_id, user_id, content } = data;
    const params = {
      Bucket: config.aws.s3.postImageBucket,
      Key: `thumbnail/${user_id}/${content}`
    };
    try {
    

      s3.getSignedUrl('getObject', params, function(err, url){
        if(err) {
          console.log(err);
          reject({ code: 103, custom_message: 'Some issue with this user' })
        }
        else {
          resolve(url);     
        }
      });
    } catch(e) {
      reject({ code: 103, message: { message: e.message, stack: e.stack } });
    }

  })
}

// module.exports.getImageForPost = (data) => {
//   return new Promise(async (resolve, reject) => {
//     const { post_id, user_id } = data;
   
//     console.log(user_id);
//     console.log(post_id);

//     const params = {
//       Bucket: config.aws.s3.postImageBucket,
//       Key: `images/${user_id}/9b1210cb-d0a3-4c52-be1a-92726ea7e673`
//     };
//     try {
//       s3.getObject(params, function(err, data) {
//         if (err) console.log(err, err.stack); // an error occurred
//         else   {
//           console.log(data);   
//           res.send(data);
//         }          // successful response
//         /*
//         data = {
//          AcceptRanges: "bytes", 
//          ContentLength: 3191, 
//          ContentType: "image/jpeg", 
//          ETag: "\"6805f2cfc46c0f04559748bb039d69ae\"", 
//          LastModified: <Date Representation>, 
//          Metadata: {
//          }, 
//          TagCount: 2, 
//          VersionId: "null"
//         }
//         */
//       });
//     } catch(e) {
//       reject({ code: 103, message: { message: e.message, stack: e.stack } });
//     }

//   })
// }

