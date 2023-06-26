const express = require('express');
const router = express.Router();

const pessoaController = require('../controllers/pessoaController');

router.get('/pessoa/cadastrar', pessoaController.listarPessoas);

module.exports = router;