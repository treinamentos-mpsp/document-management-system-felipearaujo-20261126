const documentsService = require('../services/documents.service');

function requireOwner(req, res, next) {
  const owner = req.get('X-User-Id');

  if (!owner) {
    return res.status(400).json({ error: 'Cabeçalho X-User-Id é obrigatório' });
  }

  req.owner = owner;
  return next();
}

function toResponse(document) {
  const { storedName, ...publicFields } = document;
  return publicFields;
}

function upload(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'Arquivo não enviado no campo "file"' });
  }

  const document = documentsService.createDocument(req.owner, req.file);
  return res.status(201).json(toResponse(document));
}

function list(req, res) {
  const documents = documentsService.listDocuments(req.owner);
  return res.json(documents.map(toResponse));
}

function download(req, res, next) {
  try {
    const { filePath, originalName } = documentsService.getDownload(req.params.id, req.owner);
    return res.download(filePath, originalName, (err) => {
      if (err && !res.headersSent) {
        next(err);
      }
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  requireOwner,
  uploadMiddleware: documentsService.uploadMiddleware,
  upload,
  list,
  download,
};
