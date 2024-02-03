const express = require("express");
const router = express.Router();

const User = require("../models/user");

router.get("/user/list", async (req, res) => {
  try {
    //find all users
    const allUsers = await User.findAll();

    res.status(200).json({ allUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
