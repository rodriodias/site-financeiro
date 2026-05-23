const express = require('express');
const router = express.Router();

const orcamentoController = require('../controllers/orcamentoController');
const autenticarToken = require('../middlewares/authMiddleware');

router.post('/', autenticarToken, orcamentoController.criarOrcamento);
router.get('/', autenticarToken, orcamentoController.listarOrcamentos);

module.exports = router;