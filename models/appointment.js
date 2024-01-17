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
    date:{
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
    additional_service:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    client_note: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    doctor_note:{
        type: DataTypes.STRING,
        allowNull: false,
    }
});

appointment.sync()

module.exports = appointment;