const express = require("express");
const router = express.Router();
const Appointment = require("../models/appointment")
const AdditionalService = require("../models/AdditionalService")
const Services = require("../models/services")
const moment = require('moment');
const { Op } = require("sequelize")

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
            service_cost: mainService.service_cost,
            client_note
        });

        if (Array.isArray(additional_service) && additional_service.length > 0) {
            const createdServices = await Promise.all(additional_service.map(async service_description => {
                const additional = await Services.findOne({ where: { service_name: service_description } });
                if (!additional) {
                    console.error(`Service details not found for '${service_description}'`);
                    return null;
                }
                return AdditionalService.create({
                    service_description,
                    service_cost: additional.service_cost,
                    appointmentId: newAppointment.id
                });
            }));

            // Filter out any null values from createdServices array
            const validServices = createdServices.filter(service => service !== null);

            newAppointment.setDataValue('additional_services', validServices);
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
                attributes: ['service_description', 'service_cost']
            }
        });

        // Format the fetched appointments
        const formattedAppointments = userAppointments.map(appointment => {
            const additionalServices = appointment.AdditionalServices.map(service => ({
                service_description: service.service_description,
                service_cost: service.service_cost
            }));

            return {
                appointment_start: `${appointment.date} ${appointment.start_time}`,
                appointment_end: `${appointment.date} ${appointment.end_time}`,
                service: appointment.service,
                service_cost: appointment.service_cost,
                additional_services: additionalServices,
                my_note: appointment.client_note,
                doctor_note: appointment.doctor_note,
                approval: appointment.approval === 1 ? 'accepted' : (appointment.approval === 2 ? 'rejected' : 'pending'),
                // status: appointment.approval === 0 ? 'N/A' : (appointment.approval === 1 ? 'upcoming' : 'done')
            };
        });

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
        const { id, approval, doctor_note } = req.query;
        // const doctor_note = req.body.doctor_note

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
        await Appointment.update({ status, doctor_note }, { where: { id: id } });

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
                    attributes: ['service_description', 'service_cost']
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
                    attributes: ['service_description', 'service_cost']
                }
            ]
        })

        res.status(200).json({ allAppointments })

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
})

// APPOINTMENTS CREATED PER DAY

router.get('/appointment/numbers', async (req, res) => {
    try {
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        const today = new Date();
        const currentDateString = today.toISOString().split("T")[0];

        // Fetch appointments within the specified date range
        const whereCondition = {
            createdAt: {
                [Op.between]: [startDate || currentDateString, endDate || currentDateString],
            },
        };
        const appointments = await Appointment.findAll({ where: whereCondition });

        // Count appointments per day
        const countsPerDay = {};
        appointments.forEach(appointment => {
            const date = new Date(appointment.createdAt).toISOString().split("T")[0];
            countsPerDay[date] = countsPerDay[date] ? countsPerDay[date] + 1 : 1;
        });

        // Convert countsPerDay object into an array of objects
        const countsArray = Object.keys(countsPerDay).map(date => ({
            date: formatDate(date),
            count: countsPerDay[date]
        }));

        res.json(countsArray);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//TOP SERVICES AVAILED

router.get('/top/services', async (req, res) => {
    try {
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const today = new Date();
        const currentDateString = today.toISOString().split("T")[0];

        const whereCondition = {};
        if (startDate || endDate) {
            whereCondition.createdAt = {
                [Op.between]: [startDate || currentDateString, endDate || currentDateString],
            };
        }

        // Fetch appointments within the specified date range
        const appointments = await Appointment.findAll({ where: whereCondition });

        // Count occurrences of each service
        const additionalServices = await AdditionalService.findAll({ where: whereCondition });

        // Count occurrences of each service from appointments
        const serviceCounts = {};
        appointments.forEach(appointment => {
            const service = appointment.service;
            serviceCounts[service] = (serviceCounts[service] || 0) + 1;
        });

        // Count occurrences of each additional service
        additionalServices.forEach(additionalService => {
            const service = additionalService.service_description;
            serviceCounts[service] = (serviceCounts[service] || 0) + 1;
        });

        // Convert serviceCounts object into an array of objects
        const topServices = Object.keys(serviceCounts).map(service => ({
            service: service,
            count: serviceCounts[service]
        }));

        // Sort the array by count in descending order
        topServices.sort((a, b) => b.count - a.count);

        res.json(topServices);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//
router.get("/approved/appointment/num", async (req, res) => {
    try {
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        const today = new Date();
        const currentDateString = today.toISOString().split("T")[0];

        // Fetch appointments within the specified date range
        const whereCondition = {
            createdAt: {
                [Op.between]: [startDate || currentDateString, endDate || currentDateString],
            },
            status: 2
        };
        const appointments = await Appointment.findAll({ where: whereCondition });
        const count = appointments.length;

        res.json({ count });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

router.get("/pending/appointment/num", async (req, res) => {
    try {
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        const today = new Date();
        const currentDateString = today.toISOString().split("T")[0];

        // Fetch appointments within the specified date range
        const whereCondition = {
            createdAt: {
                [Op.between]: [startDate || currentDateString, endDate || currentDateString],
            },
            status: 0
        };
        const appointments = await Appointment.findAll({ where: whereCondition });
        const count = appointments.length;

        res.json({ count });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

router.get("/appointment/today", async (req, res) => {
    try {
        // Get today's date in the desired format
        const today = moment().format('YYYY-MM-DD');
        const endDate = moment(today).endOf('day');
        console.log(endDate)

        // Fetch appointments for today
        const appointments = await Appointment.findAll({
            where: {
                date: endDate.toDate(),
                status: 2
            }
        });

        // Count the number of appointments for today
        const count = appointments.length;

        res.json({ count });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Function to format date to human-readable format
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

module.exports = router