"use strict";

module.exports = function (sequelize, DataTypes) {
  var Config = sequelize.define("Config", {
    id: {
      type: DataTypes.INTEGER,
      unique: true,
      autoIncrement: true,
      primaryKey: true
    },
    params: {
      type: DataTypes.STRING,
    },
    value: {
      type: DataTypes.STRING,
    }
  });
  Config.associate = function (models) {

  };
  return Creneau;
};
