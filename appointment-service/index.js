const grpcServer = require('./src/grpc-server');
const kafkaProducer = require('./src/kafka/producer');
const kafkaConsumer = require('./src/kafka/consumer');

const GRPC_PORT = process.env.GRPC_PORT || 50052;

async function main() {
  await kafkaProducer.connect();

  const consumer = await kafkaConsumer.connect(['prescription.issued']);
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const data = JSON.parse(message.value.toString());
      console.log(`Appointment Service received: ${topic}`, data);
    },
  });

  grpcServer.start(GRPC_PORT);
}

main().catch(console.error);
