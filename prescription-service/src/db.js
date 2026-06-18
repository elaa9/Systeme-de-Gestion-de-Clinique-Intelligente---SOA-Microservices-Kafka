const Datastore = require('nedb-promises');
const path = require('path');

const db = Datastore.create({
  filename: path.join(__dirname, '..', 'data', 'prescriptions.db'),
  autoload: true,
});

module.exports = db;
