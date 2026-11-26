const multer = require('multer');
const { DocumentNotFoundError } = require('../services/documents.errors');

const MULTER_ERRORS = {
  LIMIT_FILE_SIZE: { status: 413, message: 'Arquivo acima do tamanho máximo permitido' },
  LIMIT_UNEXPECTED_FILE: { status: 400, message: 'Arquivo não enviado no campo "file"' },
};

function mapError(err) {
  if (err instanceof multer.MulterError) {
    return MULTER_ERRORS[err.code] || { status: 400, message: 'Requisição de upload inválida' };
  }

  if (err instanceof DocumentNotFoundError) {
    return { status: 404, message: err.message };
  }

  if (err.expose) {
    return { status: err.status, message: err.message };
  }

  return { status: 500, message: 'Erro interno do servidor' };
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const { status, message } = mapError(err);

  if (status >= 500) {
    console.error(err);
  }

  return res.status(status).json({ error: message });
}

module.exports = errorHandler;
