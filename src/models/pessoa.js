const Sequelize = require('sequelize');
const database = require('../db');

const Pessoa = database.define('pessoa', {

  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  nome: {
    type: Sequelize.STRING(64),
    allowNull: false
  },
  cpf: {
    type: Sequelize.BIGINT,
    allowNull: false,
    unique: true
  },
  data_nascimento: {
    type: Sequelize.DATEONLY,
    allowNull: false
  },
  telefone: {
    type: Sequelize.BIGINT,
    allowNull: false
  },
  endereco: {
    type: Sequelize.STRING(255),
    allowNull: false
  },
  cep: {
    type: Sequelize.BIGINT,
    allowNull: false
  }

});

module.exports = Pessoa;