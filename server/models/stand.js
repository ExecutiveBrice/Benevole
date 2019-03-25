"use strict";

module.exports = function (sequelize, DataTypes) {
  var Stand = sequelize.define("Stand", {
    id: {
      type: DataTypes.INTEGER,
      unique: true,
      autoIncrement: true,
      primaryKey: true
    },
    nom: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.STRING,
    },
    limite: {
      type: DataTypes.INTEGER,
    }
  });
  Stand.associate = function (models) {
    models.Stand.hasMany(models.Croisement, {
      foreignKey: "stand"
    })
  };
  return Stand;
};
