const express = require("express");
const router = express.Router();

const User = require("../models/user");
const Appointment = require("../models/appointment")

router.get("/user/profile", async (req, res) => {
    try {
        const email = req.query.email;

        // Find the user by email
        const findUser = await User.findOne({
            where: {
                email: email
            }
        });

        // If user not found, return an error response
        if (!findUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Get the user's name
        const userName = findUser.name;

        // Count the appointments associated with the user
        const appointmentCount = await Appointment.count({
            where: {
                name: userName // Assuming the name field in the Appointment model corresponds to the user's name
            }
        });

        res.status(200).json({ findUser, appointmentCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router