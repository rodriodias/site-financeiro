const express = require('express');
const multer = require('multer');
const path = require('path');

const autenticarToken = require('../middlewares/authMiddleware');
const documentoController = require('../controllers/documentoController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },

  filename: (req, file, cb) => {
    const nomeUnico = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extensao = path.extname(file.originalname);

    cb(null, nomeUnico + extensao);
  }
});

const filtroArquivo = (req, file, cb) => {
  const tiposPermitidos = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ];

  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido.'));
  }
};

const upload = multer({
  storage,
  fileFilter: filtroArquivo,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

router.post(
  '/upload',
  autenticarToken,
  upload.single('documento'),
  documentoController.uploadDocumento
);

router.get(
  '/',
  autenticarToken,
  documentoController.listarDocumentos
);

module.exports = router;