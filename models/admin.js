// models/User.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Admin = sequelize.define("Admin", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    }
});

Admin.sync()

module.exports = Admin;