const { buildSchema } = require('graphql');

const schema = buildSchema(`
  type Patient {
    id:            ID!
    name:          String!
    birth_date:    String!
    email:         String!
    phone:         String!
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
`);

module.exports = schema;
