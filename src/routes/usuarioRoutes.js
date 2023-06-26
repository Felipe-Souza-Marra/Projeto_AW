const express = require('express');
const router = express.Router();
const autenticador = require('../models/usuario/autenticadorUsuario')

const usuarioController = require('../controllers/usuarioController');

// Views que podem ser acessadas diretamente 
router.get('/usuario/cadastro', usuarioController.cadastrarView);
router.get('/usuario/logar', usuarioController.logarView);
router.get('/usuario/deslogar', autenticador.autenticar(), usuarioController.deslogar);

// Views que precisam de ação para acontecer
router.post('/usuario/cadastro', usuarioController.cadastrarUsuario);
router.post('/usuario/logar', usuarioController.logarUsuario);

module.exports = router;