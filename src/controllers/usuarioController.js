const Usuario = require('../models/usuario/usuario')
const Pessoa = require('../models/pessoa')

function cadastrarView(req, res) {

  res.render('usuario/cadastrar.html')

}

function removerNaoNumericos(string) {
  return string.replace(/\D/g, '');
}

async function cadastrarUsuario(req, res) {

  // Dados da pessoa
  let pessoaModel = {
    nome: req.body.nome,
    cpf: removerNaoNumericos(req.body.cpf),
    data_nascimento: req.body.data_nascimento,
    telefone: removerNaoNumericos(req.body.telefone),
    endereco: req.body.endereco,
    cep: removerNaoNumericos(req.body.cep)
  };

  // Dados do usuário
  let usuario = {
    email: req.body.email,
    password: req.body.password
  };
  let repeticaoSenha = req.body.password_rep;

  let erro = null;
  if (usuario.password === repeticaoSenha && usuario.password.length > 0) {

    // Tenta criar a pessoa ou retorna o erro
    await Pessoa.create(pessoaModel).then(async (pessoa) => {
      usuario.pessoa_id = pessoa.id;
      await Usuario.create(usuario).catch((err) => {
        Pessoa.destroy({
          where: {
            id: pessoa.id
          }
        });
        erro = 'Error: ' + err;
      });
    }).catch((err) => {
      erro = 'Error: ' + err;
    });

  } else {

    erro = "As senhas não são iguais.";

  }

  console.log(erro);

  if (erro != null) {
    let pessoa = {
      nome: req.body.nome,
      cpf: req.body.cpf,
      data_nascimento: req.body.data_nascimento,
      telefone: req.body.telefone,
      endereco: req.body.endereco,
      cep: req.body.cep
    };

    res.render('usuario/cadastrar.html', { pessoa, usuario, erro });
  } else {
    res.redirect('/');
  }

}

function logarView(req, res) {
  res.render('usuario/logar.html')
}

async function logarUsuario(req, res) {

  // Dados para Logar
  let login = {
    email: req.body.email,
    password: req.body.password
  };

  // Dados para lógica
  let erro = null
  let usuarioLogin = null

  // Acha o usuário, confere os dados e se tudo estiver certo aloca usuarioLogin
  await Usuario.findOne({ where: { email: login.email } }).then((usuario) => {
    if (usuario.password != login.password) {
      erro = 'Usuário ou senha incorretos.';
    } else {
      usuarioLogin = usuario
    }
  }).catch(() => {
    erro = 'Usuário ou senha incorretos.';
  });

  // Faz a identificação se tudo está certo com o Login
  if (erro != null) {
    let email = login.email;
    res.render('usuario/logar.html', { email, erro });
  } else {
    req.session.autenticado = true;
    req.session.usuario = usuarioLogin;
    await Pessoa.findOne({ where: { id: usuarioLogin.pessoa_id } }).then((pessoa) => {
      req.session.pessoa = pessoa;
    });
    // console.log(req.session.pessoa);
    // console.log(req.session.usuario);
    res.redirect('/contaCorrente/lista');
  }

}

function deslogar(req, res) {

  req.session.destroy();

  res.redirect('/usuario/logar');

}

module.exports = {
  cadastrarView,
  cadastrarUsuario,
  logarView,
  logarUsuario,
  deslogar
};