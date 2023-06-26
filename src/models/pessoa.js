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
    validate: {
      isNumeric: true
    },
    allowNull: false,
    unique: true
  },
  data_nascimento: {
    type: Sequelize.DATEONLY,
    validate: {
      isDate: true
    },
    allowNull: false
  },
  telefone: {
    type: Sequelize.BIGINT,
    validate: {
      isNumeric: true
    },
    allowNull: false
  },
  endereco: {
    type: Sequelize.STRING(255),
    allowNull: false
  },
  cep: {
    type: Sequelize.BIGINT,
    validate: {
      isNumeric: true
    },
    allowNull: false
  }

});

module.exports = Pessoa;