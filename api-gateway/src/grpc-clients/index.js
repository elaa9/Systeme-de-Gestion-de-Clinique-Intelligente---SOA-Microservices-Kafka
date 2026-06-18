const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_DIR = path.join(__dirname, '..', '..', '..', 'proto');

const loadOptions = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};

const patientDef = protoLoader.loadSync(path.join(PROTO_DIR, 'patient.proto'), loadOptions);
const appointmentDef = protoLoader.loadSync(path.join(PROTO_DIR, 'appointment.proto'), loadOptions);
const prescriptionDef = protoLoader.loadSync(path.join(PROTO_DIR, 'prescription.proto'), loadOptions);

const patientProto = grpc.loadPackageDefinition(patientDef).patient;
const appointmentProto = grpc.loadPackageDefinition(appointmentDef).appointment;
const prescriptionProto = grpc.loadPackageDefinition(prescriptionDef).prescription;

function createClient(ProtoService, address) {
  return new ProtoService(address, grpc.credentials.createInsecure());
}

const PATIENT_ADDR = process.env.PATIENT_SERVICE_ADDR || 'localhost:50051';
const APPOINTMENT_ADDR = process.env.APPOINTMENT_SERVICE_ADDR || 'localhost:50052';
const PRESCRIPTION_ADDR = process.env.PRESCRIPTION_SERVICE_ADDR || 'localhost:50053';

const patientClient = createClient(patientProto.PatientService, PATIENT_ADDR);
const appointmentClient = createClient(appointmentProto.AppointmentService, APPOINTMENT_ADDR);
const prescriptionClient = createClient(prescriptionProto.PrescriptionService, PRESCRIPTION_ADDR);

function promisify(client, method) {
  return (request) => new Promise((resolve, reject) => {
    client[method](request, (error, response) => {
      if (error) reject(error);
      else resolve(response);
    });
  });
}

module.exports = {
  patient: {
    createPatient: promisify(patientClient, 'CreatePatient'),
    getPatient: promisify(patientClient, 'GetPatient'),
    listPatients: promisify(patientClient, 'ListPatients'),
    updatePatient: promisify(patientClient, 'UpdatePatient'),
    deletePatient: promisify(patientClient, 'DeletePatient'),
  },
  appointment: {
    bookAppointment: promisify(appointmentClient, 'BookAppointment'),
    getAppointment: promisify(appointmentClient, 'GetAppointment'),
    listAppointments: promisify(appointmentClient, 'ListAppointments'),
    cancelAppointment: promisify(appointmentClient, 'CancelAppointment'),
    completeAppointment: promisify(appointmentClient, 'CompleteAppointment'),
  },
  prescription: {
    createPrescription: promisify(prescriptionClient, 'CreatePrescription'),
    getPrescription: promisify(prescriptionClient, 'GetPrescription'),
    listPrescriptions: promisify(prescriptionClient, 'ListPrescriptions'),
  },
};
