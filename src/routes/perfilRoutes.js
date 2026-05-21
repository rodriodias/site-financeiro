const express = require('express');
const router = express.Router();

const autenticarToken = require('../middlewares/authMiddleware');
const perfilController = require('../controllers/perfilController');

router.get('/', autenticarToken, perfilController.meuPerfil);

module.exports = router;