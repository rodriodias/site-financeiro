const express = require('express');
const router = express.Router();

const autenticarToken = require('../middlewares/authMiddleware');
const transacaoController = require('../controllers/transacaoController');

router.post('/', autenticarToken, transacaoController.criarTransacao);
router.get('/', autenticarToken, transacaoController.listarTransacoes);
router.get('/resumo', autenticarToken, transacaoController.resumoFinanceiro);
router.get('/resumo-mensal', autenticarToken, transacaoController.resumoMensal);
router.get('/gastos-categoria', autenticarToken, transacaoController.gastosPorCategoria);
router.put('/:id', autenticarToken, transacaoController.editarTransacao);
router.delete('/:id', autenticarToken, transacaoController.excluirTransacao);

module.exports = router;