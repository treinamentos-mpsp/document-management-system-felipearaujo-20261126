const documentsService = require('../services/documents.service');
const { DocumentNotFoundError } = require('../services/documents.errors');

function encodeRfc5987(value) {
  return encodeURIComponent(value).replace(
    /['()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function buildContentDisposition(fileName) {
  const asciiName = fileName.replace(/[^\x20-\x7e]|["\\]/g, '_');
  return `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeRfc5987(fileName)}`;
}

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
  let file;

  try {
    file = documentsService.getDownload(req.params.id, req.owner);
  } catch (err) {
    return next(err);
  }

  res.attachment(file.originalName);
  res.set('Content-Disposition', buildContentDisposition(file.originalName));

  file.stream.on('error', (err) => {
    if (res.headersSent) {
      return res.destroy(err);
    }

    res.removeHeader('Content-Disposition');
    res.removeHeader('Content-Type');
    return next(err.code === 'ENOENT' ? new DocumentNotFoundError() : err);
  });

  return file.stream.pipe(res);
}

module.exports = {
  requireOwner,
  upload,
  list,
  download,
};
