const { randomUUID } = require('node:crypto');
const documentsRepository = require('../repositories/documents.repository');
const { DocumentNotFoundError } = require('./documents.errors');

function createDocument(owner, file) {
  return documentsRepository.save({
    id: randomUUID(),
    originalName: file.originalname,
    storedName: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
  });
}

function listDocuments(owner) {
  return documentsRepository.findByOwner(owner);
}

function getDownload(id, owner) {
  const document = documentsRepository.findById(id);

  if (!document || document.owner !== owner) {
    throw new DocumentNotFoundError();
  }

  return {
    stream: documentsRepository.openReadStream(document.storedName),
    originalName: document.originalName,
  };
}

module.exports = {
  createDocument,
  listDocuments,
  getDownload,
};
