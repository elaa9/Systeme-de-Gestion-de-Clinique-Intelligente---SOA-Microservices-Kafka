const { createRxDatabase } = require('rxdb');
const { getRxStorageDexie } = require('rxdb-plugins-storage-dexie');

let db = null;

async function getDatabase() {
  if (db) return db;

  db = await createRxDatabase({
    name: 'prescriptionsdb',
    storage: getRxStorageDexie(),
  });

  await db.addCollections({
    prescriptions: {
      schema: {
        version: 0,
        primaryKey: 'id',
        type: 'object',
        properties: {
          id: { type: 'string', maxLength: 100 },
          patient_id: { type: 'string' },
          appointment_id: { type: 'string' },
          drug: { type: 'string' },
          dosage: { type: 'string' },
          instructions: { type: 'string' },
          created_at: { type: 'string' },
        },
        required: ['id', 'patient_id', 'appointment_id', 'drug', 'dosage'],
      },
    },
  });

  return db;
}

module.exports = { getDatabase };
