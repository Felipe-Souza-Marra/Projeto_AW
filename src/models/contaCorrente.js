const Sequelize = require('sequelize');
const database = require('../db');
const Usuario = require("./usuario");

const ContaCorrente = database.define("conta_corrente", {

  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  numero: {
    type: Sequelize.BIGINT,
    allowNull: false,
    unique: true
  },
  nome: {
    type: Sequelize.STRING(255),
    allowNull: false
  },
  data_abertura: {
    type: Sequelize.DATE,
    allowNull: false
  },
  saldo: {
    type: Sequelize.DOUBLE,
    allowNull: false
  }

});

ContaCorrente.belongsTo(Usuario, {
  foreignKey: 'usuario_id',
  allowNull: false
});

module.exports = ContaCorrente;