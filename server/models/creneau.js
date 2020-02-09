"use strict";

module.exports = function(sequelize, DataTypes) {
  var Creneau = sequelize.define("Creneau", {
    id: {
      type: DataTypes.INTEGER,
      unique: true,
      autoIncrement: true,
      primaryKey: true
    },
    plage: {
      type: DataTypes.STRING,
    },
    ordre: {
      type: DataTypes.INTEGER,
    },
    groupe: {
      type: DataTypes.INTEGER,
    },
    chevauchement: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
    },
  });
  Creneau.associate = function(models) {
    models.Stand.hasMany(models.Croisement, {onDelete: 'cascade', hooks: true,foreignKey: { allowNull: false } ,
      foreignKey: "creneau"
    })
  };
  return Creneau;
};
