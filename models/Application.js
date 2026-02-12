const { DataTypes } = require("sequelize");
const sequelize = require("./index");
const Candidate = require("./Candidate");
const Job = require("./Job");

const Application = sequelize.define("Application", {
  stage: {
    type: DataTypes.ENUM("Applied","Screening","Interview","Offer","Hired"),
    defaultValue: "Applied",
  },
  notes: { type: DataTypes.TEXT },
});

Application.belongsTo(Candidate);
Candidate.hasMany(Application);

Application.belongsTo(Job);
Job.hasMany(Application);

module.exports = Application;
