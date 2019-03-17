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
      references: 'Croisement',
      referencesKey: 'id',
      allowNull: false
    },
    benevole: {
      type: DataTypes.INTEGER,
      references: 'Benevole',
      referencesKey: 'id',
      allowNull: false
    }
  });
  ResaBenevoles.associate = function(models) {

  };
  return ResaBenevoles;
};
