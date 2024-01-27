// models/additionalService.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); 
const Appointment = require('./appointment');

const AdditionalService = sequelize.define('AdditionalService', {
  service_description: DataTypes.STRING,
  service_cost: DataTypes.INTEGER,
});

// Define the association
AdditionalService.belongsTo(Appointment);
Appointment.hasMany(AdditionalService);

// AdditionalService.sync()

module.exports = AdditionalService;
