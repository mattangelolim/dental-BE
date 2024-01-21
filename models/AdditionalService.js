// models/additionalService.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); 
const Appointment = require('./appointment');

const AdditionalService = sequelize.define('AdditionalService', {
  service_description: DataTypes.STRING,
});

// Define the association
AdditionalService.belongsTo(Appointment);
Appointment.hasMany(AdditionalService);

// AdditionalService.sync()

module.exports = AdditionalService;
