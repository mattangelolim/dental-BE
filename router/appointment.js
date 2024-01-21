const express = require("express");
const router = express.Router();
const Appointment = require("../models/appointment")
const AdditionalService = require("../models/AdditionalService")

router.post("/book/appointment", async (req, res) => {
    try {
        const name = req.cookies.username;
        const { phone, date, start_time, end_time, service, tooth_name, additional_service, client_note } = req.body;

        // Create a new appointment
        const newAppointment = await Appointment.create({
            name,
            contact: phone,
            date,
            start_time,
            end_time,
            service,
            tooth_name,
            client_note
        });

        // Create and associate additional services
        if (Array.isArray(additional_service) && additional_service.length > 0) {
            const createdServices = await AdditionalService.bulkCreate(
                additional_service.map(service_description => ({
                    service_description,
                    appointmentId: newAppointment.id
                }))
            );

            newAppointment.setDataValue('additional_services', createdServices);
        }

        res.status(201).json({
            message: "Appointment booked successfully",
            appointment: newAppointment
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

router.get("/fetch/appointment", async (req, res) => {
    try {
        const name = req.query.name;

        // Retrieve appointments for the given user
        const userAppointments = await Appointment.findAll({
            where: {
                name: name
            },
            include: {
                model: AdditionalService,
                attributes: ['service_description']
            }
        });

        // Format the fetched appointments
        const formattedAppointments = userAppointments.map(appointment => ({
            appointment_start: `${appointment.date} ${appointment.start_time}`,
            appointment_end: `${appointment.date} ${appointment.end_time}`,
            service: appointment.service,
            additional_service: appointment.AdditionalServices.map(service => service.service_description),
            my_note: appointment.client_note,
            doctor_note: appointment.doctor_note,
            approval: appointment.approval === 1 ? 'accepted' : (appointment.approval === 2 ? 'rejected' : 'pending'),
            // status: appointment.approval === 0 ? 'N/A' : (appointment.approval === 1 ? 'upcoming' : 'done')
        }));

        res.status(200).json({
            message: "Appointments fetched successfully",
            appointments: formattedAppointments
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router