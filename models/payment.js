// models/User.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const payment = sequelize.define("payment", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    }, 
    appointment_uid: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    mop: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    appointment_type:{
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Online"
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Paid', 'Rejected'), 
        allowNull: false,
        defaultValue:'Pending'
    },
});

// payment.sync()

module.exports = payment;