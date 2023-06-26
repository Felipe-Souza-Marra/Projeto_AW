const express = require('express');
const router = express.Router();
const autenticador = require('../models/usuario/autenticadorUsuario')

const contaCorrenteController = require('../controllers/contaCorrenteController');

router.get('/contaCorrente/cadastrar', autenticador.autenticar(), contaCorrenteController.cadastrarView);
router.post('/contaCorrente/cadastrar', contaCorrenteController.cadastrarContaCorrente);
router.get('/contaCorrente/lista', autenticador.autenticar(), contaCorrenteController.listarContaCorrente);
router.get('/contaCorrente/informacao/:id', autenticador.autenticar(), contaCorrenteController.informacao);

module.exports = router;