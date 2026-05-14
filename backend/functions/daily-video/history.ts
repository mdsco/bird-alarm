import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { DeviceHistory, AssignedVideo } from './types';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION ?? 'us-east-1',
  ...(process.env.LOCALSTACK_ENDPOINT && {
    endpoint: process.env.LOCALSTACK_ENDPOINT,
  }),
});
const ddb = DynamoDBDocumentClient.from(client);
const TABLE = process.env.DYNAMODB_TABLE ?? 'bird-alarm-history';

export async function getDeviceHistory(deviceId: string): Promise<DeviceHistory | null> {
  const result = await ddb.send(
    new GetCommand({
      TableName: TABLE,
      Key: { device_id: deviceId },
    }),
  );
  return (result.Item as DeviceHistory) ?? null;
}

export async function recordAssignment(
  deviceId: string,
  assignment: AssignedVideo,
): Promise<void> {
  await ddb.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { device_id: deviceId },
      // Append to list if it exists; create it if this is the first assignment
      UpdateExpression:
        'SET assigned_videos = list_append(if_not_exists(assigned_videos, :empty), :new), last_assigned_date = :date',
      ExpressionAttributeValues: {
        ':empty': [],
        ':new': [assignment],
        ':date': assignment.assignedDate,
      },
    }),
  );
}
