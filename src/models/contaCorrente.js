const Sequelize = require('sequelize');
const database = require('../db');
const Usuario = require("./usuario/usuario");

const ContaCorrente = database.define("conta_corrente", {

  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  numero: {
    type: Sequelize.BIGINT,
    validate: {
      isNumeric: true
    },
    allowNull: false,
    unique: true
  },
  nome: {
    type: Sequelize.STRING(255),
    allowNull: false
  },
  data_abertura: {
    type: Sequelize.DATEONLY,
    validate: {
      isDate: true
    },
    allowNull: false
  },
  saldo: {
    type: Sequelize.DOUBLE,
    validate: {
      isFloat: true
    },
    allowNull: false
  }

});

ContaCorrente.belongsTo(Usuario, {
  foreignKey: 'usuario_id',
  allowNull: false
});

module.exports = ContaCorrente;