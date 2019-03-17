"use strict";

module.exports = function (sequelize, DataTypes) {
  var Croisement = sequelize.define("Croisement", {
    id: {
      type: DataTypes.INTEGER,
      unique: true,
      autoIncrement: true,
      primaryKey: true
    },
    prenom: {
      type: DataTypes.STRING,
    },
    nom: {
      type: DataTypes.STRING,
    },
    telephone: {
      type: DataTypes.STRING,
    },
    mail: {
      type: DataTypes.STRING,
    },
    limite: {
      type: DataTypes.INTEGER,
    },
    croisements: {
      type: DataTypes.croisements,
    },
  });
  Croisement.associate = function (models) {
    models.Croisement.belongsTo(models.Stand, {
      foreignKey: "id"
    }),
    models.Croisement.belongsTo(models.Creneau, {
      foreignKey: "id"
    }),
    models.Croisement.belongsToMany(Benevole, { through: ResaBenevoles });

  };
  return Croisement;
};
