const grpcServer = require('./src/grpc-server');
const kafkaProducer = require('./src/kafka/producer');

const GRPC_PORT = process.env.GRPC_PORT || 50051;

async function main() {
  await kafkaProducer.connect();
  grpcServer.start(GRPC_PORT);
}

main().catch(console.error);
