const express = require("express");
const router = express.Router();
const Appointment = require("../models/appointment")
const AdditionalService = require("../models/AdditionalService")
const Services = require("../models/services")

router.post("/book/appointment", async (req, res) => {
    try {
        const { phone, date, start_time, service_name, tooth_name, additional_service, client_note } = req.body;

        // Convert start_time to a Date object
        const startTime = new Date(`${date}T${start_time}`);

        // Fetch the main service details (including estimated time)
        const mainService = await Services.findOne({ where: { service_name } });

        // Calculate the total duration by summing up the estimated times
        let totalDuration = mainService.estimated_time;

        // Fetch additional services details and add their estimated times to total duration
        if (Array.isArray(additional_service) && additional_service.length > 0) {
            const additionalServices = await Services.findAll({ where: { service_name: additional_service } });
            additionalServices.forEach(service => {
                totalDuration += service.estimated_time;
            });
        }

        // Calculate end time by adding total duration to start time
        const endTime = new Date(startTime.getTime() + totalDuration * 60 * 60 * 1000); // Convert hours to milliseconds

        // Format end time as "HH:MM:SS"
        const formattedEndTime = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}:${endTime.getSeconds().toString().padStart(2, '0')}`;

        // Check if the calculated end_time conflicts with any existing appointments
        const existingAppointments = await Appointment.findAll({
            where: { date },
            attributes: ['start_time']
        });

        for (const appointment of existingAppointments) {
            const existingStartTime = new Date(`${date}T${appointment.start_time}`);
            if (existingStartTime <= endTime) {
                res.status(409).json({ message: "There's a conflict in schedule" });
                return;
            }
        }

        // Create a new appointment
        const newAppointment = await Appointment.create({
            name: req.cookies.username,
            contact: phone,
            date,
            start_time,
            end_time: formattedEndTime,
            service: service_name,
            tooth_name,
            client_note
        });

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


router.post("/approve/appointment", async (req, res) => {
    try {
        const { id, approval } = req.query;

        // Define the status based on the approval value
        let status;
        if (approval === 'Declined') {
            status = 1; // Declined status code
        } else if (approval === 'Approved') {
            status = 2; // Approved status code
        } else {
            // If neither Declined nor Approved, return a bad request response
            return res.status(400).json({ message: "Invalid approval status" });
        }

        // Update the status of the appointment in the database
        await Appointment.update({ status }, { where: { id: id } });

        res.status(200).json({ message: "Appointment approval status updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

router.get("/fetch/pending/Appointments", async (req, res) => {
    try {
        const pendingAppointments = await Appointment.findAll({
            where: {
                status: 0
            },
            include: [
                {
                    model: AdditionalService,
                    attributes: ['service_description']
                }
            ]
        })

        res.status(200).json({ pendingAppointments })

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
})

router.get("/fetch/all/Appointments", async (req, res) => {
    try {
        const allAppointments = await Appointment.findAll({
            include: [
                {
                    model: AdditionalService,
                    attributes: ['service_description']
                }
            ]
        })

        res.status(200).json({ allAppointments })

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
})

module.exports = router