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
    validate: {
      is: /^[DC]$/
      // is: ["/^[DC]$/", 'i']
    },
    allowNull: false
  },
  data_movimento: {
    type: Sequelize.DATE,
    validate: {
      isDate: true
    },
    allowNull: false
  },
  valor: {
    type: Sequelize.DOUBLE,
    validate: {
      isFloat: true
    },
    allowNull: false
  },
  contacorrente_origem: {
    type: Sequelize.BIGINT,
    validate: {
      isNumeric: true
    }
  },
  contacorrente_destino: {
    type: Sequelize.BIGINT,
    validate: {
      isNumeric: true
    }
  },
  observacao: {
    type: Sequelize.STRING(255)
  }

})

Movimento.belongsTo(ContaCorrente, {
  foreignKey: 'contacorrente_id',
  allowNull: false
});

module.exports = Movimento;