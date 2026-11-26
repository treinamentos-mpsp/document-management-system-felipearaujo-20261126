const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const multer = require('multer');
const config = require('../config');

const SAFE_EXTENSION_PATTERN = /^\.[a-z0-9]{1,10}$/;

fs.mkdirSync(config.storageDir, { recursive: true });

function safeExtension(originalName) {
  const extension = path.extname(originalName).toLowerCase();
  return SAFE_EXTENSION_PATTERN.test(extension) ? extension : '';
}

const storage = multer.diskStorage({
  destination: config.storageDir,
  filename: (req, file, cb) => cb(null, `${randomUUID()}${safeExtension(file.originalname)}`),
});

const multerSingleFile = multer({
  storage,
  limits: { fileSize: config.maxFileSize },
}).single('file');

// O multer decodifica o nome original como latin1; convertemos de volta para UTF-8.
function uploadSingleFile(req, res, next) {
  multerSingleFile(req, res, (err) => {
    if (req.file) {
      req.file.originalname = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
    }

    next(err);
  });
}

module.exports = { uploadSingleFile };
