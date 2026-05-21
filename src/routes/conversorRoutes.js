const express = require('express');
const multer = require('multer');
const path = require('path');

const conversorController = require('../controllers/conversorController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const caminhoUploads = path.join(__dirname, '../../uploads');

    cb(null, caminhoUploads);
  },

  filename: (req, file, cb) => {
    const nomeUnico = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extensao = path.extname(file.originalname);

    cb(null, nomeUnico + extensao);
  }
});

const filtroImagem = (req, file, cb) => {
  const tiposPermitidos = [
    'image/jpeg',
    'image/png'
  ];

  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Envie apenas imagens JPG ou PNG.'));
  }
};

const upload = multer({
  storage,
  fileFilter: filtroImagem,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

router.post(
  '/imagem-para-pdf',
  upload.single('imagem'),
  conversorController.imagemParaPdf
);

module.exports = router;