import {APIGatewayEvent, APIGatewayProxyHandler} from "aws-lambda";
import DynamoDB from 'aws-sdk/clients/dynamodb';
import '../environment'
import {wrapperForApiG as wrapper} from "./lib";
const { TABLE } = process.env;

const DocumentClient = new DynamoDB.DocumentClient();

export const check: APIGatewayProxyHandler = wrapper(async (event: APIGatewayEvent) => {
  console.log('event', JSON.stringify(event, null, 2));

  const sessionId = event.queryStringParameters?.sessionId? event.queryStringParameters.sessionId : 'no-sessionId';

  const { Items } = await DocumentClient.query({
    TableName: TABLE,
    KeyConditionExpression: "#name1 = :value1",
    ExpressionAttributeValues: {
      ":value1": sessionId,
    },
    ExpressionAttributeNames: {
      "#name1": "sessionId",
    },
  }).promise();

  console.log('Items', Items);

  return { Items };
})
