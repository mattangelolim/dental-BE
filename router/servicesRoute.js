const express = require("express")
const router = express.Router()
const Services = require("../models/services")

router.get("/list/services", async (req, res) => {
    try {
        const FindAllServices = await Services.findAll()

        res.status(200).json({ FindAllServices })

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error.message })
    }
})

router.post("/add/dental/service", async (req, res) => {
    try {
        const { service_name, service_cost, estimated_time, description } = req.body;

        // Check if the service_name already exists
        const existingService = await Services.findOne({
            where: {
                service_name: service_name
            }
        });

        if (existingService) {
            return res.status(400).json({ message: 'Service with the same name already exists' });
        }

        // If the service_name doesn't exist, add the new service
        const newService = await Services.create({
            service_name,
            service_cost,
            estimated_time,
            description
        });

        res.status(201).json(newService);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

router.post("/update/dental/service", async (req, res) => {
    try {
        const { service_name, service_cost, estimated_time, description } = req.body;

        // Check if the service_name exists
        const existingService = await Services.findOne({
            where: {
                service_name: service_name
            }
        });

        if (!existingService) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // If the service_name exists, update the service
        existingService.service_cost = service_cost;
        existingService.estimated_time = estimated_time;
        existingService.description = description;
        await existingService.save();

        res.status(200).json(existingService);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

router.post("/delete/dental/service", async (req, res) => {
    try {
        const { service_name } = req.body;

        // Check if the service_name exists
        const existingService = await Services.findOne({
            where: {
                service_name: service_name
            }
        });

        if (!existingService) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // If the service_name exists, delete the service
        await existingService.remove();

        res.status(200).json({ message: 'Service deleted successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router