"use strict";

module.exports = function(sequelize, DataTypes) {
  var Reservation = sequelize.define("Reservation", {
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
    tel: {
      type: DataTypes.STRING,
    },
    mail: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.STRING,
    },
    produit: {
      type: DataTypes.STRING,
    },
    date: {
      type: DataTypes.DATE,
    },
    etat: {
      type: DataTypes.STRING,
    },
    alerte: {
      type: DataTypes.INTEGER,
    }
  });
  Reservation.associate = function(models) {
  };
  return Reservation;
};
