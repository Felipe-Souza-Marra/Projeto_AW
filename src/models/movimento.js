const Sequelize = require('sequelize');
const database = require('../db');
const ContaCorrente = require("./contaCorrente");

const Movimento = database.define("movimento", {

  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  tipo: {
    type: Sequelize.STRING(1),
    allowNull: false
  },
  data_movimento: {
    type: Sequelize.DATE,
    allowNull: false
  },
  valor: {
    type: Sequelize.DOUBLE,
    allowNull: false
  },
  contacorrente_origem: {
    type: Sequelize.BIGINT
  },
  contacorrente_destino: {
    type: Sequelize.BIGINT
  }

})

Movimento.belongsTo(ContaCorrente, {
  foreignKey: 'contacorrente_id',
  allowNull: false
});

module.exports = Movimento;