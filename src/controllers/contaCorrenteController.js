const ContaCorrente = require('../models/contaCorrente');

function cadastrarView(req, res) {
  console.log('Cadastro de Conta Corrente');
  res.render('conta_corrente/cadastrar.html');
}

async function cadastrarContaCorrente(req, res) {

  const contaCorrente = {
    nome: req.body.nome,
    saldo: 0
  };

  let ultimaContaCorrente = await ContaCorrente.findOne({ order: [['id', 'DESC']] });

  let proximoNumeroContaCorrente;

  if (ultimaContaCorrente) {
    // Obtém o último número da conta
    const ultimoNumeroContaCorrente = ultimaContaCorrente.numero;

    // Incrementa o último número da conta em 1
    proximoNumeroContaCorrente = ultimoNumeroContaCorrente + 1;
  } else {
    // Caso não existam contas cadastradas ainda, define um valor inicial
    proximoNumeroContaCorrente = 1;
  }

  // Coloca o próximo número das Conta Corrente
  contaCorrente.numero = proximoNumeroContaCorrente;

  const data = new Date(Date.now());

  const dataFormatada = `${data.getFullYear()}-${data.getMonth() + 1}-${data.getDate()}`;

  contaCorrente.data_abertura = dataFormatada;
  contaCorrente.usuario_id = req.session.usuario.id;
  console.log(contaCorrente);

  let erro = null;

  if (contaCorrente.nome.length == 0) {
    erro = 'Nome da Conta Corrente não pode ser vázio.';
  }

  if (erro ==  null) { await ContaCorrente.create(contaCorrente); }

  if (erro != null){
    res.render('conta_corrente/cadastrar.html', { 'erro': erro});
  } else { res.redirect('/contaCorrente/lista'); }

}

async function listarContaCorrente(req, res) {

  console.log('Lista de Conta Corrente');

  let conta_correntes = []
  await ContaCorrente.findAll({ where: { usuario_id: req.session.usuario.id } }).then((contasCorrentes) => {
    for (let contaCorrente of contasCorrentes) {
      console.log(contaCorrente);
      conta_correntes.push({ 
        numero: contaCorrente.numero,
        saldo: contaCorrente.saldo,
        id_hist: contaCorrente.id,
        id_info: contaCorrente.id,
        id_movi: contaCorrente.id
      });
    }
    console.log(conta_correntes)
  });

  res.render('conta_corrente/listar.html', { conta_correntes });

}

async function informacao(req, res) {

  let achouContaCorrente = false;
  let contaCorrente = {};

  await ContaCorrente.findOne({
    where: {
      id: req.params.id,
      usuario_id: req.session.usuario.id
    }
  }).then((contaCorrenteVerificacao) => {
    if (contaCorrenteVerificacao != null) {
      achouContaCorrente = true
      contaCorrente.nome = contaCorrenteVerificacao.nome
      contaCorrente.saldo = contaCorrenteVerificacao.saldo
    }
  });

  if (achouContaCorrente) {
    res.render('conta_corrente/informacao.html', { contaCorrente });
  } else { res.redirect('/contaCorrente/lista'); }

}

module.exports = {
  cadastrarView,
  cadastrarContaCorrente,
  listarContaCorrente,
  informacao
};