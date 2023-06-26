const express = require('express');
const mustacheExpress = require('mustache-express');
const db = require('./src/db');
const sessao = require('./src/models/usuario/autenticadorUsuario');

const app = express();

app.use(sessao.criarSessao());

app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.set('views', __dirname + '/src/views');

app.use(express.urlencoded({ extended: true }));

// Define as rotas da aplicação (declaradas na pasta /src/routes/)
app.get('/', function (req, res) { res.render('index.html') })
app.use('/', require('./src/routes/contaCorrenteRoutes'));
app.use('/', require('./src/routes/movimentoRoutes'));
app.use('/', require('./src/routes/pessoaRoutes'));
app.use('/', require('./src/routes/usuarioRoutes'));

db.sync(() => console.log(`Banco de dados conectado`));

const app_port = 8000
app.listen(app_port, function () {
  console.log('app rodando na porta ' + app_port)
})