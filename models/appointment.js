// models/User.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const appointment = sequelize.define("appointment", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    contact: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    start_time: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    end_time: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    service: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    tooth_name: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
    },
    service_cost:{
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    client_note: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    },
    approval: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    },
    doctor_note: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
});

// appointment.sync()

module.exports = appointment;