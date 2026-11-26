const fs = require('node:fs');
const path = require('node:path');
const config = require('../config');

const STORED_NAME_PATTERN = /^[0-9a-f-]{36}(\.[a-z0-9]{1,10})?$/;

const documents = new Map();

function save(metadata) {
  documents.set(metadata.id, metadata);
  return metadata;
}

function findById(id) {
  return documents.get(id) || null;
}

function findByOwner(owner) {
  return [...documents.values()].filter((document) => document.owner === owner);
}

function openReadStream(storedName) {
  if (!STORED_NAME_PATTERN.test(storedName)) {
    throw new Error(`Nome de arquivo armazenado inválido: ${storedName}`);
  }

  return fs.createReadStream(path.join(config.storageDir, storedName));
}

module.exports = {
  save,
  findById,
  findByOwner,
  openReadStream,
};
