const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

const PROTO_PATH = path.join(__dirname, '..', '..', 'proto', 'patient.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const patientProto = grpc.loadPackageDefinition(packageDefinition).patient;

function CreatePatient(call, callback) {
  const { name, birth_date, email, phone } = call.request;
  const id = uuidv4();
  try {
    const stmt = db.prepare('INSERT INTO patients (id, name, birth_date, email, phone) VALUES (?, ?, ?, ?, ?)');
    stmt.run(id, name, birth_date, email, phone);
    callback(null, { id, name, birth_date, email, phone });
  } catch (err) {
    callback({ code: grpc.status.ALREADY_EXISTS, message: err.message });
  }
}

function GetPatient(call, callback) {
  const { id } = call.request;
  const row = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
  if (!row) {
    return callback({ code: grpc.status.NOT_FOUND, message: 'Patient not found' });
  }
  callback(null, { id: row.id, name: row.name, birth_date: row.birth_date, email: row.email, phone: row.phone });
}

function ListPatients(call, callback) {
  const rows = db.prepare('SELECT * FROM patients').all();
  const patients = rows.map(r => ({ id: r.id, name: r.name, birth_date: r.birth_date, email: r.email, phone: r.phone }));
  callback(null, { patients });
}

function UpdatePatient(call, callback) {
  const { id, name, email, phone } = call.request;
  const existing = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
  if (!existing) {
    return callback({ code: grpc.status.NOT_FOUND, message: 'Patient not found' });
  }
  db.prepare('UPDATE patients SET name = ?, email = ?, phone = ? WHERE id = ?')
    .run(name || existing.name, email || existing.email, phone || existing.phone, id);
  const updated = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
  callback(null, { id: updated.id, name: updated.name, birth_date: updated.birth_date, email: updated.email, phone: updated.phone });
}

function DeletePatient(call, callback) {
  const { id } = call.request;
  const existing = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
  if (!existing) {
    return callback({ code: grpc.status.NOT_FOUND, message: 'Patient not found' });
  }
  db.prepare('DELETE FROM patients WHERE id = ?').run(id);
  callback(null, { success: true });
}

function start(port) {
  const server = new grpc.Server();
  server.addService(patientProto.PatientService.service, {
    CreatePatient,
    GetPatient,
    ListPatients,
    UpdatePatient,
    DeletePatient,
  });

  server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, boundPort) => {
    if (err) {
      console.error('Failed to bind:', err);
      return;
    }
    server.start();
    console.log(`Patient gRPC server listening on port ${boundPort}`);
  });

  return server;
}

module.exports = { start };
