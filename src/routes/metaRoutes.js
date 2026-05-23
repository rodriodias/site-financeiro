const express = require('express');
const router = express.Router();

const metaController = require('../controllers/metaController');
const autenticarToken = require('../middlewares/authMiddleware');

router.post('/', autenticarToken, metaController.criarMeta);
router.get('/', autenticarToken, metaController.listarMetas);

router.put('/:id', autenticarToken, metaController.editarMeta);
router.delete('/:id', autenticarToken, metaController.excluirMeta);

module.exports = router;