import * as AWS from 'aws-sdk';
import {APIGatewayEvent, APIGatewayProxyHandler} from "aws-lambda";
import { wrapperForApiG as wrapper } from './lib';

const { UPLOAD_BUCKET } = process.env;

const s3 = new AWS.S3();

export const sign: APIGatewayProxyHandler = wrapper(async (event: APIGatewayEvent) => {
  console.log('event:\n', JSON.stringify(event));

  const sessionId = event.queryStringParameters?.sessionId? event.queryStringParameters.sessionId : 'no-sessionId';
  const filename = event.queryStringParameters?.filename? event.queryStringParameters.filename : 'no-filename';
  const key = sessionId + '_' + filename;

  const params = {
    Bucket: UPLOAD_BUCKET,
    Fields: {
      key,
    },
    Expires: 300,
    Conditions: [
      ["content-length-range", 0, 524288],  // Max size 512KB
    ]
  };

  console.log('params', params)
  const data = await createPresignedPostPromise(params);

  return { data };
});

function createPresignedPostPromise(params: AWS.S3.PresignedPost.Params) {
  return new Promise((resolve, reject) => {
    s3.createPresignedPost(params, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    })
  });
}
