import * as AWS from 'aws-sdk';
import {APIGatewayEvent, APIGatewayProxyResult} from "aws-lambda";
import {ulid} from "ulid";

const { UPLOAD_BUCKET } = process.env;

const s3 = new AWS.S3();

export async function sign(event: APIGatewayEvent): Promise<APIGatewayProxyResult> {
  console.log('event:\n', JSON.stringify(event));

  const id = ulid();

  const params = {
    Bucket: UPLOAD_BUCKET,
    Fields: {
      key: id
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
    body: JSON.stringify({ id, data }),
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
