const Movimento = require('../models/movimento');
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
  let especificando = false;

  var data1 = new Date(req.query.inicial);
  var data2 = new Date(req.query.final);

  if (data1 < data2) {
    especificando = true;
  }

  console.log(data1);
  console.log(data2);
  console.log(req.query.inicial);
  console.log(req.query.final);

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

    let datas = {
      inicial: null,
      final: null
    };

    if (especificando) {

      datas.inicial = new Date(req.query.inicial);
      datas.final = new Date(req.query.final);

      console.log(datas.final);

      datas.final.setDate(datas.final.getDate() + 1);
      datas.final.setHours(20);
      datas.final.setMinutes(59);
      datas.final.setSeconds(59);
      datas.final.setMilliseconds(999);

      console.log(datas.final);

      await Movimento.findAll(
        {
          where: {
            contacorrente_id: req.params.id,
            [Op.or]: [
              { data_movimento: { [Op.between]: [datas.inicial, datas.final] } },
              { data_movimento: datas.inicial },
              { data_movimento: datas.final }
            ]
          },
          order: [['data_movimento', 'DESC']]
        }
      ).then(async (contaMovimentos) => {
        console.log(movimentos);
        for (let movimento of contaMovimentos) {

          let nome = null;
          let positivo = null;
          let negativo = null;

          if (movimento.contacorrente_destino != null) {
            negativo = '- ' + Number(movimento.valor);
            nome = await ContaCorrente.findOne({ where: { id: movimento.contacorrente_destino } }).then((contaCorrente) => { return contaCorrente.nome });
          }
          if (movimento.contacorrente_origem != null) {
            positivo = Number(movimento.valor);
            nome = await ContaCorrente.findOne({ where: { id: movimento.contacorrente_origem } }).then((contaCorrente) => { return contaCorrente.nome });
          }

          if (movimento.observacao != null) {
            positivo = Number(movimento.valor);
            nome = 'Da Árvore de Dinheiro'
          }

          movimentos.push({
            nome: nome,
            negativo: negativo,
            positivo: positivo,
            data: `${movimento.data_movimento.getDate()}/${movimento.data_movimento.getMonth() + 1}/${movimento.data_movimento.getFullYear()}`,
            horario: `${movimento.data_movimento.getHours()}:${movimento.data_movimento.getMinutes()}:${movimento.data_movimento.getSeconds()}`
          });
        }
      })

    } else {

      datas.inicial = Date.now();
      datas.final = Date.now();

      await Movimento.findAll(
        {
          where: { contacorrente_id: req.params.id },
          order: [['data_movimento', 'DESC']]
        }
      ).then(async (contaMovimentos) => {
        console.log(movimentos);
        for (let movimento of contaMovimentos) {

          let nome = null;
          let positivo = null;
          let negativo = null;

          if (movimento.contacorrente_destino != null) {
            negativo = '- ' + Number(movimento.valor);
            nome = await ContaCorrente.findOne({ where: { id: movimento.contacorrente_destino } }).then((contaCorrente) => { return contaCorrente.nome });
          }
          if (movimento.contacorrente_origem != null) {
            positivo = Number(movimento.valor);
            nome = await ContaCorrente.findOne({ where: { id: movimento.contacorrente_origem } }).then((contaCorrente) => { return contaCorrente.nome });
          }

          if (movimento.observacao != null) {
            positivo = Number(movimento.valor);
            nome = 'Da Árvore de Dinheiro'
          }

          console.log(movimento.data_movimento);

          if (datas.inicial > movimento.data_movimento) {
            console.log('Menor');
            datas.inicial = movimento.data_movimento;
          }
          if (datas.final < movimento.data_movimento) {
            console.log('Maior');
            datas.final = movimento.data_movimento;
          }

          movimentos.push({
            nome: nome,
            negativo: negativo,
            positivo: positivo,
            data: `${movimento.data_movimento.getDate()}/${movimento.data_movimento.getMonth() + 1}/${movimento.data_movimento.getFullYear()}`,
            horario: `${movimento.data_movimento.getHours()}:${movimento.data_movimento.getMinutes()}:${movimento.data_movimento.getSeconds()}`
          });
        }
      })

    }

    console.log(datas);
    let dataInicial = new Date(datas.inicial);
    let dataFinal = new Date(datas.final);

    let inicial = `${dataInicial.getUTCFullYear().toString()}-${(dataInicial.getUTCMonth() + 1).toString().padStart(2, "0")}-${dataInicial.getUTCDate().toString().padStart(2, "0")}`;
    let final = `${dataFinal.getUTCFullYear().toString()}-${(dataFinal.getUTCMonth() + 1).toString().padStart(2, "0")}-${dataFinal.getUTCDate().toString().padStart(2, "0")}`;

    res.render('movimento/listar.html', { movimentos, "inicial": inicial, "final": final, "id": req.params.id });

  } else { res.redirect('/contaCorrente/lista'); }

}

module.exports = {
  cadastrarDepositoView,
  cadastrarDeposito,
  cadastrarMovimentoView,
  cadastrarMovimento,
  listarMovimentos
};