const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

const PROTO_PATH = path.join(__dirname, '..', '..', 'proto', 'appointment.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const appointmentProto = grpc.loadPackageDefinition(packageDefinition).appointment;

function BookAppointment(call, callback) {
  const { patient_id, doctor, date } = call.request;
  const id = uuidv4();
  const stmt = db.prepare('INSERT INTO appointments (id, patient_id, doctor, date, status) VALUES (?, ?, ?, ?, ?)');
  stmt.run(id, patient_id, doctor, date, 'PENDING');
  callback(null, { id, patient_id, doctor, date, status: 'PENDING' });
}

function GetAppointment(call, callback) {
  const { id } = call.request;
  const row = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
  if (!row) {
    return callback({ code: grpc.status.NOT_FOUND, message: 'Appointment not found' });
  }
  callback(null, {
    id: row.id, patient_id: row.patient_id, doctor: row.doctor,
    date: row.date, status: row.status,
  });
}

function ListAppointments(call, callback) {
  const { patient_id } = call.request;
  let rows;
  if (patient_id) {
    rows = db.prepare('SELECT * FROM appointments WHERE patient_id = ?').all(patient_id);
  } else {
    rows = db.prepare('SELECT * FROM appointments').all();
  }
  const appointments = rows.map(r => ({
    id: r.id, patient_id: r.patient_id, doctor: r.doctor,
    date: r.date, status: r.status,
  }));
  callback(null, { appointments });
}

function CancelAppointment(call, callback) {
  const { id } = call.request;
  const existing = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
  if (!existing) {
    return callback({ code: grpc.status.NOT_FOUND, message: 'Appointment not found' });
  }
  db.prepare("UPDATE appointments SET status = 'CANCELLED' WHERE id = ?").run(id);
  callback(null, { success: true });
}

function CompleteAppointment(call, callback) {
  const { id } = call.request;
  const existing = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
  if (!existing) {
    return callback({ code: grpc.status.NOT_FOUND, message: 'Appointment not found' });
  }
  db.prepare("UPDATE appointments SET status = 'COMPLETED' WHERE id = ?").run(id);
  const updated = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
  callback(null, {
    id: updated.id, patient_id: updated.patient_id, doctor: updated.doctor,
    date: updated.date, status: updated.status,
  });
}

function start(port) {
  const server = new grpc.Server();
  server.addService(appointmentProto.AppointmentService.service, {
    BookAppointment,
    GetAppointment,
    ListAppointments,
    CancelAppointment,
    CompleteAppointment,
  });

  server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, boundPort) => {
    if (err) {
      console.error('Failed to bind:', err);
      return;
    }
    server.start();
    console.log(`Appointment gRPC server listening on port ${boundPort}`);
  });

  return server;
}

module.exports = { start };
