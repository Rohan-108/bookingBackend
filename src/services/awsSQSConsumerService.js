import { parentPort } from "worker_threads";
import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
import { sendEmail } from "./mailService.js";
// Configure the SQS client
const REGION = process.env.AWS_REGION;
const queueUrl = `https://sqs.${REGION}.amazonaws.com/${process.env.AWS_ACCOUNT_ID}/${process.env.SQS_QUEUE_NAME}`;
const sqsClient = new SQSClient({ region: REGION });

const pollQueue = async () => {
  const params = {
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 10,
    WaitTimeSeconds: 10,
  };

  try {
    const data = await sqsClient.send(new ReceiveMessageCommand(params));
    if (data.Messages && data.Messages.length > 0) {
      for (const message of data.Messages) {
        parentPort.postMessage(`Received message: ${message.Body}`);
        // Send an email using the message body
        const data = JSON.parse(message.Body);
        // Send an email using the message body
        await sendEmail(data.email, data.subject, data.Body);
        const deleteParams = {
          QueueUrl: queueUrl,
          ReceiptHandle: message.ReceiptHandle,
        };
        await sqsClient.send(new DeleteMessageCommand(deleteParams));
        parentPort.postMessage("Message deleted from the queue.");
      }
    } else {
      parentPort.postMessage("No messages received.");
    }
  } catch (err) {
    parentPort.postMessage(`Error: ${err}`);
  }
};

// Start polling when the worker thread starts
// Set an interval to poll the queue every 10 seconds
const startConsumer = () => {
  pollQueue().finally(() => {
    setTimeout(startConsumer, 10000); // Poll every 10 seconds
  });
};
startConsumer();
