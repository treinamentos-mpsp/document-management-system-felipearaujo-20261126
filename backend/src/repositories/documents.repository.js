const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const multer = require('multer');

const STORAGE_DIR = process.env.STORAGE_DIR || path.join(__dirname, '..', '..', 'storage');
const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024;

fs.mkdirSync(STORAGE_DIR, { recursive: true });

const documents = new Map();

const storage = multer.diskStorage({
  destination: STORAGE_DIR,
  filename: (req, file, cb) => cb(null, `${randomUUID()}${path.extname(file.originalname)}`),
});

const uploadMiddleware = multer({ storage, limits: { fileSize: MAX_FILE_SIZE } });

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

function resolveFilePath(storedName) {
  return path.join(STORAGE_DIR, storedName);
}

module.exports = {
  uploadMiddleware,
  save,
  findById,
  findByOwner,
  resolveFilePath,
};
