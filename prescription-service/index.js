const grpcServer = require('./src/grpc-server');
const kafkaConsumer = require('./src/kafka/consumer');
const db = require('./src/db');
const { v4: uuidv4 } = require('uuid');

const GRPC_PORT = process.env.GRPC_PORT || 50053;

async function connectKafka() {
  try {
    const consumer = await kafkaConsumer.connect(['appointment.booked', 'appointment.completed']);
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const data = JSON.parse(message.value.toString());
        console.log(`Prescription Service received: ${topic}`, data);

        if (topic === 'appointment.booked') {
          await db.insert({
            id: uuidv4(),
            patient_id: data.patientId,
            appointment_id: data.appointmentId,
            drug: 'Pending',
            dosage: 'Pending',
            instructions: 'Prescription template created',
            created_at: new Date().toISOString(),
          });
          console.log('Prescription template created for appointment', data.appointmentId);
        }
      },
    });

    console.log('Prescription Service connected to Kafka');
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
