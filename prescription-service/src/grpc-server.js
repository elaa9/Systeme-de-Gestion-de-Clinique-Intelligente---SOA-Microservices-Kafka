const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('./db');

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
    const dbRx = await getDatabase();
    await dbRx.prescriptions.insert({
      id,
      patient_id,
      appointment_id,
      drug,
      dosage,
      instructions: instructions || '',
      created_at: new Date().toISOString(),
    });
    callback(null, { id, patient_id, appointment_id, drug, dosage, instructions: instructions || '' });
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

async function GetPrescription(call, callback) {
  const { id } = call.request;
  try {
    const dbRx = await getDatabase();
    const doc = await dbRx.prescriptions.findOne(id).exec();
    if (!doc) {
      return callback({ code: grpc.status.NOT_FOUND, message: 'Prescription not found' });
    }
    const data = doc.toJSON();
    callback(null, {
      id: data.id, patient_id: data.patient_id, appointment_id: data.appointment_id,
      drug: data.drug, dosage: data.dosage, instructions: data.instructions,
    });
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

async function ListPrescriptions(call, callback) {
  const { patient_id } = call.request;
  try {
    const dbRx = await getDatabase();
    let docs;
    if (patient_id) {
      docs = await dbRx.prescriptions.find({ selector: { patient_id } }).exec();
    } else {
      docs = await dbRx.prescriptions.find().exec();
    }
    const prescriptions = docs.map(doc => {
      const data = doc.toJSON();
      return {
        id: data.id, patient_id: data.patient_id, appointment_id: data.appointment_id,
        drug: data.drug, dosage: data.dosage, instructions: data.instructions,
      };
    });
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
