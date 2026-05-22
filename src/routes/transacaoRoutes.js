const express = require('express');
const router = express.Router();

const autenticarToken = require('../middlewares/authMiddleware');
const transacaoController = require('../controllers/transacaoController');

router.post('/', autenticarToken, transacaoController.criarTransacao);
router.get('/', autenticarToken, transacaoController.listarTransacoes);
router.get('/resumo', autenticarToken, transacaoController.resumoFinanceiro);

module.exports = router;