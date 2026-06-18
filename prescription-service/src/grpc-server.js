const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

const PROTO_PATH = path.join(__dirname, '..', '..', 'proto', 'prescription.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const prescriptionProto = grpc.loadPackageDefinition(packageDefinition).prescription;

async function CreatePrescription(call, callback) {
  const { patient_id, appointment_id, drug, dosage, instructions } = call.request;
  const id = uuidv4();
  try {
    const doc = await db.insert({
      id,
      patient_id,
      appointment_id,
      drug,
      dosage,
      instructions: instructions || '',
      created_at: new Date().toISOString(),
    });
    callback(null, { id: doc.id, patient_id: doc.patient_id, appointment_id: doc.appointment_id, drug: doc.drug, dosage: doc.dosage, instructions: doc.instructions });
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

async function GetPrescription(call, callback) {
  const { id } = call.request;
  try {
    const doc = await db.findOne({ id }).exec();
    if (!doc) {
      return callback({ code: grpc.status.NOT_FOUND, message: 'Prescription not found' });
    }
    callback(null, { id: doc.id, patient_id: doc.patient_id, appointment_id: doc.appointment_id, drug: doc.drug, dosage: doc.dosage, instructions: doc.instructions });
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

async function ListPrescriptions(call, callback) {
  const { patient_id } = call.request;
  try {
    let docs;
    if (patient_id) {
      docs = await db.find({ patient_id }).exec();
    } else {
      docs = await db.find({}).exec();
    }
    const prescriptions = docs.map(doc => ({
      id: doc.id, patient_id: doc.patient_id, appointment_id: doc.appointment_id,
      drug: doc.drug, dosage: doc.dosage, instructions: doc.instructions,
    }));
    callback(null, { prescriptions });
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

function start(port) {
  const server = new grpc.Server();
  server.addService(prescriptionProto.PrescriptionService.service, {
    CreatePrescription,
    GetPrescription,
    ListPrescriptions,
  });

  server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, boundPort) => {
    if (err) {
      console.error('Failed to bind:', err);
      return;
    }
    server.start();
    console.log(`Prescription gRPC server listening on port ${boundPort}`);
  });

  return server;
}

module.exports = { start };
