import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
const REGION = process.env.AWS_REGION;
const queueUrl = `https://sqs.${REGION}.amazonaws.com/${process.env.AWS_ACCOUNT_ID}/${process.env.SQS_QUEUE_NAME}`;
const sqsClient = new SQSClient({ region: REGION });

const sendMessageToSQS = async (messageBody) => {
  try {
    const params = {
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(messageBody),
    };
    await sqsClient.send(new SendMessageCommand(params));
  } catch (error) {
    console.error("Error sending message to SQS:", error);
    throw error;
  }
};

export default sendMessageToSQS;
