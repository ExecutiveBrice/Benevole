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
      type: DataTypes.STRING,
    },
    fin: {
      type: DataTypes.STRING,
    }
  });
  Creneau.associate = function(models) {
    models.Stand.hasMany(models.Croisement, {
      foreignKey: "creneaux"
    })
  };
  return Creneau;
};
