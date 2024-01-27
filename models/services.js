// models/User.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const service = sequelize.define("service", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    service_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    service_cost: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    estimated_time: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    description:{
        type: DataTypes.TEXT,
        allowNull: false,
    }
});

// service.sync()

module.exports = service;