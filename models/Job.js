const { DataTypes } = require("sequelize");
const sequelize = require("./index");
const Recruiter = require("./Recruiter");

const Job = sequelize.define("Job", {
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  requirements: { type: DataTypes.TEXT },
  location: { type: DataTypes.STRING },
  job_type: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: "Open" },
});

Job.belongsTo(Recruiter);
Recruiter.hasMany(Job);

module.exports = Job;
