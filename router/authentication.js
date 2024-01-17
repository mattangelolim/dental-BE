const express = require("express");
const router = express.Router();

const User = require("../models/user");
const Admin = require("../models/admin")


//REGISTRATION USER
router.post("/user/register", async (req, res) => {
    try {
        const { email, phone, name, address, password } = req.body;

        const existingUser = await User.findOne({
            where: {
                email: email,
                phone: phone
            },
        });

        if (existingUser) {
            return res.status(200).json({
                message: "Email/phone is already registered",
            });
        }

        // Create a new user in the database
        const newUser = await User.create({
            email,
            phone,
            name,
            address,
            password,
        });

        res.status(201).json({
            message: "Registration successful",
            user: newUser,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: error.message,
        });
    }
});

// USER ROUTE LOGIN
router.post("/user/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const loginUserCreds = await User.findOne({
            where: {
                email: email,
                userpass: password,
            },
        });

        if (!loginUserCreds) {
            return res.status(400).json({
                message: "No user found",
            });
        }

        res.status(200).json({
            message: "login successfully",
            loginUserCreds,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: error.message,
        });
    }
});

//ADMIN ROUTE LOGIN
router.post("/admin/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        const loginUserCreds = await Admin.findOne({
            where: {
                username: username,
                password: password,
            },
        });

        if (!loginUserCreds) {
            return res.status(400).json({
                message: "No user found",
            });
        }

        res.status(200).json({
            message: "login successfully",
            loginUserCreds,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: error.message,
        });
    }
});


//FETCH PROFILE USER
router.get("/get/profile", async (req, res) => {
    try {
        const email = req.query.email

        const ClientProfile = await User.findOne({
            where: {
                email: email
            }
        })
        res.status(200).json({ ClientProfile })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal Server Error" })
    }
})

module.exports = router;