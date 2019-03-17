"use strict";

module.exports = function(sequelize, DataTypes) {
  var Creneau = sequelize.define("Creneau", {
    id: {
      type: DataTypes.INTEGER,
      unique: true,
      autoIncrement: true,
      primaryKey: true
    },
    debut: {
      type: DataTypes.DATE,
    },
    fin: {
      type: DataTypes.DATE,
    }
  });
  Creneau.associate = function(models) {

  };
  return Creneau;
};
