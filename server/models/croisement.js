"use strict";

module.exports = function (sequelize, DataTypes) {
  var Croisement = sequelize.define("Croisement", {
    id: {
      type: DataTypes.INTEGER,
      unique: true,
      autoIncrement: true,
      primaryKey: true
    },
    limite: {
      type: DataTypes.INTEGER,
    }

  });
  Croisement.associate = function (models) {
    models.Croisement.belongsTo(models.Stand, {
      foreignKey: "croisement"
    }),
    models.Croisement.belongsTo(models.Creneau, {
      foreignKey: "creneau"
    }),

    models.Croisement.belongsToMany( models.Benevole, {
      through: {
        model: models.ResaBenevoles,
        unique: false
      },
      foreignKey: 'benevole'
  });
  };
  return Croisement;
};
