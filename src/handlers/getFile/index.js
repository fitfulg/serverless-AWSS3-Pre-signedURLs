'use strict';
const AWS = require('aws-sdk');

const s3Client = new AWS.S3();

const httpResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body, null, 2),
});

module.exports.handler = async (event) => {
  const fileName =
    event.queryStringParameters && event.queryStringParameters.fileName;

  if (!fileName) return httpResponse(400, { msg: 'Filename not provided' });

  const params = {
    Bucket: process.env.SOURCE_BUCKET_NAME,
    Key: fileName,
  };

  try {
    const fileData = await s3Client.headObject(params).promise();

    if (!fileData) return httpResponse(404, { msg: 'File does not exist' });

    const action = 'getObject';
    const paramsUrl = {
      Bucket: process.env.SOURCE_BUCKET_NAME,
      Key: fileName,
      Expires: 3600,
    };

    const url = await s3Client.getSignedUrlPromise(action, paramsUrl);

    return httpResponse(200, { url });
  } catch (err) {
    if (err.code == 'NotFound')
      return httpResponse(404, { msg: 'File does not exist' });
    else return httpResponse(500, { msg: err.message });
  }
};
