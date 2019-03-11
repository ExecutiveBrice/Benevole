"use strict";

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    email: {
      type: DataTypes.STRING,
      unique: true,
      isLowerCase: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
    },
    name: {
      type: DataTypes.STRING,
    }
  });
  User.associate = function(models) {
  };
  return User;
};
