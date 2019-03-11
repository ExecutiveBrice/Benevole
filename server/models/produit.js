"use strict";

module.exports = function(sequelize, DataTypes) {
  var Produit = sequelize.define("Produit", {
    id: {
      type: DataTypes.INTEGER,
      unique: true,
      autoIncrement: true,
      primaryKey: true
    },
    nom: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    tarif: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.STRING,
    },
    image: {
      type: DataTypes.STRING,
    }
  });
  Produit.associate = function(models) {
  };
  return Produit;
};
