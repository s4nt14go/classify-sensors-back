jest.setTimeout(15000);
import { load } from 'ts-dotenv';
import axios from 'axios';
import { promises as fs } from 'fs';
import * as AWS from 'aws-sdk';
import retry from 'async-retry';
import {ulid} from "ulid";

const env = load({
  SERVICE_ENDPOINT: String,
  TABLE: String,
});

const API = env.SERVICE_ENDPOINT+'/';
const { TABLE } = env;

describe('When log files are uploaded to S3', () => {

  const sessionId = ulid();

  beforeAll(async () => {
    for (let i = 1; i < 3; i++) {
      const sessionIdIter = `${sessionId}-test-${i}`;
      const filename = `test-${i}.log`;
      let response = await axios({
        url: `${API}sign-post?sessionId=${sessionIdIter}&filename=${filename}`,
      });

      const form = new FormData();
      Object.keys(response.data.data.fields).forEach(key => form.append(key, response.data.data.fields[key]));
      const file = await fs.readFile(__dirname + `/../test-${i}.log`, "binary");
      form.append('file', file);

      // Send the POST request
      response = await axios({
        url: response.data.data.url,
        method: 'post',
        data: form
      });
    }
  })


  for (let i = 1; i < 3; i++) {
    it(`The correct classification for test-${i}.log should be saved in DynamoDB`, async () => {
      for (let i = 1; i < 3; i++) {
        const sessionIdIter = `${sessionId}-test-${i}`;
        const filename = `test-${i}.log`;
        await retry(async () => {
          const item = await getItem(sessionIdIter, filename);
          const classification = JSON.parse(item?.classification);
          if (i===1) {
            expect(classification).toEqual(
                  {
                  "f8aa668d-96b6-4f64-8179-505fa291ebd3": ["loudness", "happiness", "bumpiness"],
                  "184744bf-6439-4c9b-aeba-42e8fb6a214d": ["loudness", "happiness"]
                }
            );
          } else if (i===2) {
            expect(classification).toEqual(
                  {
                  "184744bf-6439-4c9b-aeba-42e8fb6a214d":["loudness","happiness"],
                  "f8aa668d-96b6-4f64-8179-505fa291ebd3":["loudness","happiness","bumpiness"],
                  "880f8cc0-4677-427b-944d-6cba6c17b24b":["bumpiness"]
                }
            );
          }
        }, {
          retries: 2,
          maxTimeout: 1000
        })
      }
    })
  }
});

const getItem = async (sessionId: string, filename: string) => {
  const DynamoDB = new AWS.DynamoDB.DocumentClient();

  console.log(`looking for sessionId ${sessionId} & filename ${filename} in table [${TABLE}]`)
  const resp = await DynamoDB.get({
    TableName: TABLE,
    Key: {
      sessionId,
      filename,
    }
  }).promise();
  console.log('DynamoDB response', resp);

  return resp.Item;
}
