const grpcClients = require('../grpc-clients');

const root = {
  patient: async ({ id }) => {
    return await grpcClients.patient.getPatient({ id });
  },
  patients: async () => {
    const result = await grpcClients.patient.listPatients({});
    return result.patients;
  },
  appointment: async ({ id }) => {
    return await grpcClients.appointment.getAppointment({ id });
  },
  appointmentsByPatient: async ({ patient_id }) => {
    const result = await grpcClients.appointment.listAppointments({ patient_id });
    return result.appointments;
  },
  prescription: async ({ id }) => {
    return await grpcClients.prescription.getPrescription({ id });
  },
  prescriptionsByPatient: async ({ patient_id }) => {
    const result = await grpcClients.prescription.listPrescriptions({ patient_id });
    return result.prescriptions;
  },
  createPatient: async ({ name, birth_date, email, phone }) => {
    return await grpcClients.patient.createPatient({ name, birth_date, email, phone });
  },
  updatePatient: async ({ id, name, email, phone }) => {
    return await grpcClients.patient.updatePatient({ id, name, email, phone });
  },
  deletePatient: async ({ id }) => {
    const result = await grpcClients.patient.deletePatient({ id });
    return result.success;
  },
  bookAppointment: async ({ patient_id, doctor, date }) => {
    return await grpcClients.appointment.bookAppointment({ patient_id, doctor, date });
  },
  completeAppointment: async ({ id }) => {
    return await grpcClients.appointment.completeAppointment({ id });
  },
  cancelAppointment: async ({ id }) => {
    const result = await grpcClients.appointment.cancelAppointment({ id });
    return result.success;
  },
  createPrescription: async ({ patient_id, appointment_id, drug, dosage, instructions }) => {
    return await grpcClients.prescription.createPrescription({
      patient_id, appointment_id, drug, dosage, instructions: instructions || '',
    });
  },
};

module.exports = root;
