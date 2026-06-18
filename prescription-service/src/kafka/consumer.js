const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'prescription-service',
  brokers: process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'prescription-service-group' });

async function connect(topics) {
  await consumer.connect();
  for (const topic of topics) {
    await consumer.subscribe({ topic, fromBeginning: true });
  }
  return consumer;
}

async function disconnect() {
  await consumer.disconnect();
}

module.exports = { connect, disconnect };
