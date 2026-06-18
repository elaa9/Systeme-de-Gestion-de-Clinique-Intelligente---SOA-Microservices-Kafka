const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'patient-service',
  brokers: process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : ['localhost:9092'],
});

const producer = kafka.producer();

async function connect() {
  await producer.connect();
}

async function disconnect() {
  await producer.disconnect();
}

async function send(topic, message) {
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }],
  });
}

module.exports = { connect, disconnect, send };
