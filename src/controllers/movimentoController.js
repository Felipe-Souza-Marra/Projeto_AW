const Movimento = require('../models/movimento')
const ContaCorrente = require('../models/contaCorrente');
const { Op } = require('sequelize');

function cadastrarDepositoView(req, res) {

  res.render('movimento/cadastrarDeposito.html');

}

function formatarFusoHorario(fuso) {
  var sinal = fuso < 0 ? "+" : "-";
  var horas = Math.floor(Math.abs(fuso) / 60).toString().padStart(2, "0");
  var minutos = (Math.abs(fuso) % 60).toString().padStart(2, "0");
  return sinal + horas + ":" + minutos;
}

function gerarData() {

  var dataAtual = new Date(Date.now());
  var ano = dataAtual.getFullYear().toString();
  var mes = (dataAtual.getMonth() + 1).toString().padStart(2, "0");
  var dia = dataAtual.getDate().toString().padStart(2, "0");
  var hora = dataAtual.getHours().toString().padStart(2, "0");
  var minuto = dataAtual.getMinutes().toString().padStart(2, "0");
  var segundo = dataAtual.getSeconds().toString().padStart(2, "0");
  var milissegundo = dataAtual.getMilliseconds().toString().padStart(3, "0");
  var fusoHorario = dataAtual.getTimezoneOffset();

  return `${ano}-${mes}-${dia} ${hora}:${minuto}:${segundo}.${milissegundo} ${formatarFusoHorario(fusoHorario)}`;

}

function verificarString(string, valorAlternativo) {
  if (string === "") {
    return valorAlternativo;
  } else {
    return string;
  }
}

async function cadastrarDeposito(req, res) {

  const movimento = {
    tipo: 'C',
    valor: verificarString(req.body.valor, '10.00'),
    data_movimento: gerarData(),
    observacao: 'DEPOSITO'
  };

  let erro = null;

  await ContaCorrente.findOne({ where: { numero: req.body.ncc } }).then((contaCorrente) => {
    movimento.contacorrente_id = contaCorrente.id;
  }).catch((err) => {
    erro = 'Não encontrou nenhuma conta correspondente.';
  });

  if (erro != null) {
    res.render('movimento/cadastrarDeposito.html', { 'ncc': req.body.ncc, 'valor': req.body.valor, 'erro': erro });
  } else {
    // Cria movimento
    await Movimento.create(movimento).then(async (movimento) => {
      await ContaCorrente.findOne({ where: { id: movimento.contacorrente_id } }).then(async (contaCorrente) => {
        await contaCorrente.update({ saldo: `${Number(Number(contaCorrente.saldo) + Number(movimento.valor)).toFixed(2)}` });
        await contaCorrente.save();
      });
    });
    res.redirect('/');
  }

}

async function cadastrarMovimentoView(req, res) {

  let achouContaCorrente = false;

  await ContaCorrente.findOne({
    where: {
      id: req.params.id,
      usuario_id: req.session.usuario.id
    }
  }).then((contaCorrente) => {
    if (contaCorrente != null) {
      achouContaCorrente = true
    }
  });

  if (achouContaCorrente) {
    res.render('movimento/cadastrarMovimento.html', { 'id_origem': req.params.id });
  } else {
    res.redirect('/contaCorrente/lista');
  }

}

async function cadastrarMovimento(req, res) {

  const movimento = {
    valor: req.body.valor
  };

  console.log(movimento);
  let erro = null;



  if (movimento.valor.length == 0) {
    erro = 'Valor deve conter algo.';
  }

  // Verifica se existe ou se é a mesma Conta Corrente
  let contaCorrente = null;

  if (erro == null) {
    contaCorrente = await ContaCorrente.findOne(
      {
        where: {
          [Op.and]: [
            { id: { [Op.not]: req.body.id } },
            { id: req.body.ncc }
          ]
        }
      }
    ).then((contaCorrente) => {
      if (contaCorrente == null) {
        erro = "A conta corrente não pode ser a mesma ou deve exister.";
      }
    });
  }

  // Verifica o saldo da conta
  if (erro == null) {
    await ContaCorrente.findOne({ where: { id: req.body.id } }).then((contaCorrente) => {
      if (Number(contaCorrente.saldo) < Number(movimento.valor)) {
        erro = 'Não possui saldo suficiente.'
      }
    });
  }

  // Faz os dois movimentos
  if (erro == null) {
    let movimentoOrigem = {
      contacorrente_id: req.body.id,
      tipo: 'D',
      valor: req.body.valor,
      data_movimento: gerarData(),
      contacorrente_destino: req.body.ncc
    }

    let movimentoDestino = {
      contacorrente_id: req.body.ncc,
      tipo: 'C',
      valor: req.body.valor,
      data_movimento: gerarData(),
      contacorrente_origem: req.body.id
    }

    await Movimento.create(movimentoOrigem).then(async (movimento) => {
      await ContaCorrente.findOne({ where: { id: movimento.contacorrente_id } }).then(async (contaCorrente) => {
        await contaCorrente.update({ saldo: `${Number(Number(contaCorrente.saldo) - Number(movimento.valor)).toFixed(2)}` });
        await contaCorrente.save();
      });
    });

    await Movimento.create(movimentoDestino).then(async (movimento) => {
      await ContaCorrente.findOne({ where: { id: movimento.contacorrente_id } }).then(async (contaCorrente) => {
        await contaCorrente.update({ saldo: `${Number(Number(contaCorrente.saldo) + Number(movimento.valor)).toFixed(2)}` });
        await contaCorrente.save();
      });
    });
  }

  if (erro != null) {
    res.render('movimento/cadastrarMovimento.html', { 'ncc': req.body.ncc, 'valor': req.body.valor, 'id_origem': req.body.id, 'erro': erro });
  } else {
    res.redirect('/contaCorrente/lista');
  }

}

async function listarMovimentos(req, res) {

  let achouContaCorrente = false;

  await ContaCorrente.findOne({
    where: {
      id: req.params.id,
      usuario_id: req.session.usuario.id
    }
  }).then((contaCorrente) => {
    if (contaCorrente != null) {
      achouContaCorrente = true
    }
  });

  if (achouContaCorrente) {

    let movimentos = [];

    await Movimento.findAll(
      {
        where: { contacorrente_id: req.params.id },
        order: [['data_movimento', 'DESC']]
      }
    ).then(async (contaMovimentos) => {
      console.log(movimentos);
      for (let movimento of contaMovimentos) {

        let nome = null;
        let valor = null;
        let positivo = null;
        let negativo = null;
        if (movimento.contacorrente_destino != null) {
          console.log('Trânferencia');
          negativo = '- ' + Number(movimento.valor);
          nome = await ContaCorrente.findOne({ where: { id: movimento.contacorrente_destino } }).then((contaCorrente) => { return contaCorrente.nome });
        }
        if (movimento.contacorrente_origem != null) {
          console.log('Recebimento');
          positivo = Number(movimento.valor);
          nome = await ContaCorrente.findOne({ where: { id: movimento.contacorrente_origem } }).then((contaCorrente) => { return contaCorrente.nome });
        }

        if (movimento.observacao != null) {
          console.log('Vulto');
          positivo = Number(movimento.valor);
          nome = 'Da Árvore de Dinheiro'
        }

        console.log();

        movimentos.push({
          nome: nome,
          negativo: negativo,
          positivo: positivo,
          data: `${movimento.data_movimento.getDate()}/${movimento.data_movimento.getMonth() + 1}/${movimento.data_movimento.getFullYear()}`,
          horario: `${movimento.data_movimento.getHours()}:${movimento.data_movimento.getMinutes()}:${movimento.data_movimento.getSeconds()}`
        });
      }
    })

    res.render('movimento/listar.html', { movimentos })

  } else { res.redirect('/contaCorrente/lista'); }

}

module.exports = {
  cadastrarDepositoView,
  cadastrarDeposito,
  cadastrarMovimentoView,
  cadastrarMovimento,
  listarMovimentos
};