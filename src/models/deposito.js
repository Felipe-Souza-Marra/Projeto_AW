const Sequelize = require('sequelize');
const database = require('../db');
const ContaCorrente = require("./contaCorrente");

const Deposito = database.define("deposito", {

  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  data_deposito: {
    type: Sequelize.DATE,
    allowNull: false
  },
  valor: {
    type: Sequelize.DOUBLE,
    allowNull: false
  }

})

Deposito.belongsTo(ContaCorrente, {
  foreignKey: 'contacorrente_id',
  allowNull: false
});

module.exports = Deposito;