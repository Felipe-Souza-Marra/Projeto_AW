const express = require('express');
const router = express.Router();

const autenticador = require('../models/usuario/autenticadorUsuario')

const movimentoController = require('../controllers/movimentoController');

router.get('/movimento/cadastrarDeposito', movimentoController.cadastrarDepositoView);
router.post('/movimento/cadastrarDeposito', movimentoController.cadastrarDeposito);
router.get('/movimento/cadastrarMovimento/:id', autenticador.autenticar(), movimentoController.cadastrarMovimentoView);
router.post('/movimento/cadastrarMovimento', autenticador.autenticar(),movimentoController.cadastrarMovimento);
router.get('/movimento/listar/:id', autenticador.autenticar(), movimentoController.listarMovimentos);

module.exports = router;