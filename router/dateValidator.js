const express = require("express");
const router = express.Router();
const Appointment = require("../models/appointment");

router.get("/available/time", async (req, res) => {
  try {
    const { date } = req.query; // Retrieve date from query parameters

    // Initialize variables for start and end hour
    const startHour = 8;
    const endHour = 18;

    // Generate list of available time slots from 8:00 AM to 8:00 PM
    let availableTimeSlots = [];
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        availableTimeSlots.push(
          `${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}:00`
        );
      }
    }

    // Fetch existing appointments for the given date
    const existingAppointments = await Appointment.findAll({
      where: { date },
      attributes: ["start_time", "end_time"],
    });

    // Filter out booked time slots
    existingAppointments.forEach((appointment) => {
      const { start_time, end_time } = appointment;
      const startTimeParts = start_time.split(":").map(Number);
      const endTimeParts = end_time.split(":").map(Number);

      // Remove all time slots that overlap with existing appointments
      availableTimeSlots = availableTimeSlots.filter((timeSlot) => {
        const [hour, minute] = timeSlot.split(":").map(Number);
        return hour < startTimeParts[0] || hour > endTimeParts[0];
      });
    });

    res.status(200).json({ availableTimeSlots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
