const express = require('express');
const router = express.Router();

const notificacaoController =
  require('../controllers/notificacaoController');

const autenticarToken =
  require('../middlewares/authMiddleware');

router.get(
  '/',
  autenticarToken,
  notificacaoController.listarNotificacoes
);

router.put(
  '/:id/lida',
  autenticarToken,
  notificacaoController.marcarComoLida
);

router.put(
  '/marcar-todas',
  autenticarToken,
  notificacaoController.marcarTodasComoLidas
);

router.delete(
  '/:id',
  autenticarToken,
  notificacaoController.excluirNotificacao
);

router.delete(
  '/',
  autenticarToken,
  notificacaoController.limparNotificacoes
);

module.exports = router;