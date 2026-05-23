const express = require('express');
const router = express.Router();

const autenticarToken = require('../middlewares/authMiddleware');
const categoriaController = require('../controllers/categoriaController');

router.get('/', autenticarToken, categoriaController.listarCategorias);
router.post('/', autenticarToken, categoriaController.criarCategoria);
router.delete('/:id', autenticarToken, categoriaController.excluirCategoria);

module.exports = router;