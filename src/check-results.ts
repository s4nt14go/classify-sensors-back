import {APIGatewayEvent, APIGatewayProxyResult} from "aws-lambda";
import DynamoDB from 'aws-sdk/clients/dynamodb';
import '../environment'
const { TABLE } = process.env;

const DocumentClient = new DynamoDB.DocumentClient();

export async function check(event: APIGatewayEvent): Promise<APIGatewayProxyResult> {
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

  return {
    statusCode: 200,
    body: JSON.stringify({ Items }),
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  };
}
