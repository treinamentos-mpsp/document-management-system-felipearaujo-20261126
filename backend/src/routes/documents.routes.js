const express = require('express');
const documentsController = require('../controllers/documents.controller');

const router = express.Router();

router.post(
  '/upload',
  documentsController.requireOwner,
  documentsController.uploadMiddleware.single('file'),
  documentsController.upload,
);
router.get('/documents', documentsController.requireOwner, documentsController.list);
router.get(
  '/documents/:id/download',
  documentsController.requireOwner,
  documentsController.download,
);

module.exports = router;
