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
  const { body } = event;

  if (!body) return httpResponse(400, { msg: 'No Body field inside event' });

  const { fileName, contentType } = JSON.parse(body);

  if (!fileName || !contentType)
    return httpResponse(400, {
      msg: 'No FileName or Content-Type present inside body',
    });

  const action = 'putObject';
  const params = {
    Bucket: process.env.SOURCE_BUCKET_NAME,
    Key: fileName,
    Expires: 3600,
    ContentType: contentType,
  };

  const url = await s3Client.getSignedUrlPromise(action, params);

  return httpResponse(201, {
    url,
  });
};
