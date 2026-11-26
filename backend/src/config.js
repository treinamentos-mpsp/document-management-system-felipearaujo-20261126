const path = require('node:path');

const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024;

function readPositiveInteger(name, fallback) {
  const raw = process.env[name];

  if (raw === undefined || raw === '') {
    return fallback;
  }

  const value = Number(raw);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Variável ${name} deve ser um inteiro positivo`);
  }

  return value;
}

module.exports = {
  port: readPositiveInteger('PORT', 3000),
  storageDir: process.env.STORAGE_DIR || path.join(__dirname, '..', 'storage'),
  maxFileSize: readPositiveInteger('MAX_FILE_SIZE', DEFAULT_MAX_FILE_SIZE),
};
