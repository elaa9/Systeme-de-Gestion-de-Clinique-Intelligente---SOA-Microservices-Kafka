const { makeExecutableSchema } = require('@graphql-tools/schema');
const grpcClients = require('../grpc-clients');

const typeDefs = `
  type Patient {
    id:            ID!
    name:          String!
    birth_date:    String!
    email:         String!
    phone:         String!
    appointments:  [Appointment!]!
  }

  type Appointment {
    id:         ID!
    patient_id: String!
    doctor:     String!
    date:       String!
    status:     String!
  }

  type Prescription {
    id:             ID!
    patient_id:     String!
    appointment_id: String!
    drug:           String!
    dosage:         String!
    instructions:   String!
  }

  type Query {
    patient(id: ID!):                       Patient
    patients:                               [Patient!]!
    appointment(id: ID!):                   Appointment
    appointmentsByPatient(patient_id: ID!):  [Appointment!]!
    prescription(id: ID!):                  Prescription
    prescriptionsByPatient(patient_id: ID!): [Prescription!]!
  }

  type Mutation {
    createPatient(name: String!, birth_date: String!, email: String!, phone: String!): Patient!
    updatePatient(id: ID!, name: String, email: String, phone: String): Patient!
    deletePatient(id: ID!): Boolean!
    bookAppointment(patient_id: ID!, doctor: String!, date: String!): Appointment!
    completeAppointment(id: ID!): Appointment!
    cancelAppointment(id: ID!): Boolean!
    createPrescription(patient_id: ID!, appointment_id: ID!, drug: String!, dosage: String!, instructions: String): Prescription!
  }
`;

const resolvers = {
  Patient: {
    appointments: async (parent) => {
      const result = await grpcClients.appointment.listAppointments({ patient_id: parent.id });
      return result.appointments;
    },
  },
  Query: {
    patient: async (_, { id }) => grpcClients.patient.getPatient({ id }),
    patients: async () => {
      const result = await grpcClients.patient.listPatients({});
      return result.patients;
    },
    appointment: async (_, { id }) => grpcClients.appointment.getAppointment({ id }),
    appointmentsByPatient: async (_, { patient_id }) => {
      const result = await grpcClients.appointment.listAppointments({ patient_id });
      return result.appointments;
    },
    prescription: async (_, { id }) => grpcClients.prescription.getPrescription({ id }),
    prescriptionsByPatient: async (_, { patient_id }) => {
      const result = await grpcClients.prescription.listPrescriptions({ patient_id });
      return result.prescriptions;
    },
  },
  Mutation: {
    createPatient: async (_, { name, birth_date, email, phone }) =>
      grpcClients.patient.createPatient({ name, birth_date, email, phone }),
    updatePatient: async (_, { id, name, email, phone }) =>
      grpcClients.patient.updatePatient({ id, name, email, phone }),
    deletePatient: async (_, { id }) => {
      await grpcClients.patient.deletePatient({ id });
      return true;
    },
    bookAppointment: async (_, { patient_id, doctor, date }) =>
      grpcClients.appointment.bookAppointment({ patient_id, doctor, date }),
    completeAppointment: async (_, { id }) =>
      grpcClients.appointment.completeAppointment({ id }),
    cancelAppointment: async (_, { id }) => {
      await grpcClients.appointment.cancelAppointment({ id });
      return true;
    },
    createPrescription: async (_, { patient_id, appointment_id, drug, dosage, instructions }) =>
      grpcClients.prescription.createPrescription({ patient_id, appointment_id, drug, dosage, instructions: instructions || '' }),
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

module.exports = schema;
