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
  },
  {
    schema: 'Creneaux'
  });
  Creneau.associate = function(models) {

  };
  return Creneau;
};
