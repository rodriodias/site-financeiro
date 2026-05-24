const express = require('express');
const router = express.Router();

const alertaController =
  require('../controllers/alertaController');

const autenticarToken =
  require('../middlewares/authMiddleware');

router.get(
  '/',
  autenticarToken,
  alertaController.listarAlertas
);

module.exports = router;