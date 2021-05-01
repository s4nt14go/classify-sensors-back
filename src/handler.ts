import {S3Handler} from "aws-lambda";
import * as AWS from 'aws-sdk';
const s3 = new AWS.S3();
import '../environment'
const { BUCKET_OUTPUT } = process.env;
import { evaluate } from './main';

export const classify: S3Handler = async (event, _context) => {
  console.log('event', JSON.stringify(event, null, 2));

  const filename = event.Records[0].s3.object.key;

  let classification:any;
  if (event.Records[0]) {
    const Bucket = event.Records[0].s3.bucket.name;
    const Key = decodeURIComponent(filename.replace(/\+/g, " "));
    const data = await s3.getObject({ Bucket, Key }).promise();
    const text = data.Body?.toString();
    classification = evaluate(text);
  } else {
    throw Error(`event not valid: ${event}`);
  }

  console.log(`classification for file ${filename}:`, JSON.stringify(classification, null, 2));

  const outputFilename = `${new Date().toJSON()}_${filename}.json`;

  await s3.putObject({
    Body: JSON.stringify(classification, null, 2),
    Bucket: BUCKET_OUTPUT,
    Key: outputFilename,
  }).promise();
  console.log(`Put it as ${outputFilename} in bucket: ${BUCKET_OUTPUT}`);
};
