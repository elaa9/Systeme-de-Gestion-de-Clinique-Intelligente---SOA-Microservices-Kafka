const grpcServer = require('./src/grpc-server');
const kafkaProducer = require('./src/kafka/producer');

const GRPC_PORT = process.env.GRPC_PORT || 50051;

async function connectKafka() {
  try {
    await kafkaProducer.connect();
    console.log('Patient Service connected to Kafka');
  } catch (err) {
    console.error('Kafka connection failed, retrying in 5s:', err.message);
    setTimeout(connectKafka, 5000);
  }
}

async function main() {
  connectKafka();
  grpcServer.start(GRPC_PORT);
}

main().catch(console.error);
