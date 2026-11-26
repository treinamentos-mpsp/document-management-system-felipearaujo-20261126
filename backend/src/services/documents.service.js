const { randomUUID } = require('node:crypto');
const documentsRepository = require('../repositories/documents.repository');

const { uploadMiddleware } = documentsRepository;

class DocumentNotFoundError extends Error {
  constructor() {
    super('Documento não encontrado');
    this.status = 404;
  }
}

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
    filePath: documentsRepository.resolveFilePath(document.storedName),
    originalName: document.originalName,
  };
}

module.exports = {
  uploadMiddleware,
  createDocument,
  listDocuments,
  getDownload,
};
