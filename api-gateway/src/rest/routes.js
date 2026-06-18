const express = require('express');
const grpcClients = require('../grpc-clients');

const router = express.Router();

function asyncHandler(fn) {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

router.post('/patients', asyncHandler(async (req, res) => {
  const { name, birth_date, email, phone } = req.body;
  const patient = await grpcClients.patient.createPatient({ name, birth_date, email, phone });
  res.status(201).json(patient);
}));

router.get('/patients', asyncHandler(async (req, res) => {
  const result = await grpcClients.patient.listPatients({});
  res.json(result.patients);
}));

router.get('/patients/:id', asyncHandler(async (req, res) => {
  const patient = await grpcClients.patient.getPatient({ id: req.params.id });
  res.json(patient);
}));

router.put('/patients/:id', asyncHandler(async (req, res) => {
  const { name, email, phone } = req.body;
  const patient = await grpcClients.patient.updatePatient({ id: req.params.id, name, email, phone });
  res.json(patient);
}));

router.delete('/patients/:id', asyncHandler(async (req, res) => {
  const result = await grpcClients.patient.deletePatient({ id: req.params.id });
  res.json(result);
}));

router.post('/appointments', asyncHandler(async (req, res) => {
  const { patient_id, doctor, date } = req.body;
  const appointment = await grpcClients.appointment.bookAppointment({ patient_id, doctor, date });
  res.status(201).json(appointment);
}));

router.get('/appointments', asyncHandler(async (req, res) => {
  const { patient_id } = req.query;
  const result = await grpcClients.appointment.listAppointments({ patient_id: patient_id || '' });
  res.json(result.appointments);
}));

router.get('/appointments/:id', asyncHandler(async (req, res) => {
  const appointment = await grpcClients.appointment.getAppointment({ id: req.params.id });
  res.json(appointment);
}));

router.post('/appointments/:id/complete', asyncHandler(async (req, res) => {
  const appointment = await grpcClients.appointment.completeAppointment({ id: req.params.id });
  res.json(appointment);
}));

router.post('/appointments/:id/cancel', asyncHandler(async (req, res) => {
  const result = await grpcClients.appointment.cancelAppointment({ id: req.params.id });
  res.json(result);
}));

router.post('/prescriptions', asyncHandler(async (req, res) => {
  const { patient_id, appointment_id, drug, dosage, instructions } = req.body;
  const prescription = await grpcClients.prescription.createPrescription({
    patient_id, appointment_id, drug, dosage, instructions: instructions || '',
  });
  res.status(201).json(prescription);
}));

router.get('/prescriptions', asyncHandler(async (req, res) => {
  const { patient_id } = req.query;
  const result = await grpcClients.prescription.listPrescriptions({ patient_id: patient_id || '' });
  res.json(result.prescriptions);
}));

router.get('/prescriptions/:id', asyncHandler(async (req, res) => {
  const prescription = await grpcClients.prescription.getPrescription({ id: req.params.id });
  res.json(prescription);
}));

module.exports = router;
