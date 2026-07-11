const { DataTypes } = require("sequelize");
const sequelize = require("./index");
const Recruiter = require("./Recruiter");
const Candidate = require("./Candidate");
const Application = require("./Application");

const Message = sequelize.define("Message", {
  content: { type: DataTypes.TEXT, allowNull: false },
});

Message.belongsTo(Recruiter, { as: "sender" });
Message.belongsTo(Candidate, { as: "receiver" });
Message.belongsTo(Application);

module.exports = Message;
