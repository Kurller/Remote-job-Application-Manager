const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const Recruiter = sequelize.define("Recruiter", {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
});

module.exports = Recruiter;
