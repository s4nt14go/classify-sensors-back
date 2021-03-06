import {S3Handler} from "aws-lambda";
import * as AWS from 'aws-sdk';
const s3 = new AWS.S3();
import DynamoDB from 'aws-sdk/clients/dynamodb';
import '../environment'
const { OUTPUT_BUCKET, TABLE } = process.env;
import { evaluate } from './main';

const DocumentClient = new DynamoDB.DocumentClient();

export const classify: S3Handler = async (event, _context) => {
  console.log('event', JSON.stringify(event, null, 2));

  const key = event.Records[0].s3.object.key;
  const Key = decodeURIComponent(key.replace(/\+/g, " "));

  let classification:any;
  if (event.Records[0]) {
    const Bucket = event.Records[0].s3.bucket.name;
    console.log(`Getting Bucket: ${Bucket}; Key: ${Key}`);
    const data = await s3.getObject({ Bucket, Key }).promise();
    const text = data.Body?.toString();
    classification = evaluate(text);
  } else {
    throw Error(`event not valid: ${event}`);
  }

  console.log(`classification for ${Key}:`, JSON.stringify(classification, null, 2));

  await s3.putObject({
    Body: JSON.stringify(classification, null, 2),
    Bucket: OUTPUT_BUCKET,
    Key,
  }).promise();
  console.log(`Put it as ${Key} in bucket: ${OUTPUT_BUCKET}`);

  const separatorIndex = Key.indexOf('_');
  const sessionId = Key.slice(0, separatorIndex);
  const filename = Key.slice(separatorIndex+1);

  const Item = {
    sessionId,
    filename,
    classification: JSON.stringify(classification),
    createdAt: new Date().toJSON(),
  };
  await DocumentClient.put({
    TableName: TABLE,
    Item,
  }).promise();
};
