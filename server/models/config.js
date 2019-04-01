"use strict";

module.exports = function (sequelize, DataTypes) {
  var Config = sequelize.define("Config", {
    param: {
      type: DataTypes.STRING,
      unique: true,
      primaryKey: true
    },
    value: {
      type: DataTypes.STRING,
    }
  });
  Config.associate = function (models) {

  };
  return Config;
};
