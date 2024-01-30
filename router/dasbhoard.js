const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { Op } = require("sequelize")

router.get("/clients/count", async (req, res) => {
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

        // Count the number of registered clients within the specified date range
        const count = await User.count({ where: whereCondition });

        res.json({ users: count });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
