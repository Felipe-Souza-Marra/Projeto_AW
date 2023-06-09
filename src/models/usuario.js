const Sequelize = require('sequelize');
const database = require('../db');
const Pessoa = require("./pessoa");

const Usuario = database.define('usuario', {

  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  email: {
    type: Sequelize.STRING(64),
    allowNull: false,
    unique: true
  },
  password: {
    type: Sequelize.STRING(32),
    allowNull: false
  }

});

Usuario.belongsTo(Pessoa, {
  foreignKey: 'pessoa_id',
  allowNull: false
});

module.exports = Usuario;