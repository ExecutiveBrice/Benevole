"use strict";

module.exports = function(sequelize, DataTypes) {
  var ResaBenevoles = sequelize.define("ResaBenevoles", {
    id: {
      type: DataTypes.INTEGER,
      unique: true,
      autoIncrement: true,
      primaryKey: true
    },
    croisement: {
      type: DataTypes.INTEGER,
    },
    benevole: {
      type: DataTypes.INTEGER,
    }

  });
  ResaBenevoles.associate = function(models) {

  };
  return ResaBenevoles;
};
