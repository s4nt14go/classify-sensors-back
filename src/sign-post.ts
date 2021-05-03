import * as AWS from 'aws-sdk';
import {APIGatewayEvent, APIGatewayProxyResult} from "aws-lambda";

const { UPLOAD_BUCKET } = process.env;

const s3 = new AWS.S3();

export async function sign(event: APIGatewayEvent): Promise<APIGatewayProxyResult> {
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
      ["content-length-range", 0, 524288]
    ]
  };

  console.log('params', params)
  const data = await createPresignedPostPromise(params);

  return {
    statusCode: 200,
    body: JSON.stringify({ data }),
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  };
}

function createPresignedPostPromise(params: AWS.S3.PresignedPost.Params) {
  return new Promise((resolve, reject) => {
    s3.createPresignedPost(params, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    })
  });
}
