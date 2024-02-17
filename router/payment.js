const express = require("express")
const router = express.Router()
const Payment = require("../models/payment")

router.get("/appointment/payments", async (req, res) => {
    try {
        const fetchPayments = await Payment.findAll()

        res.json(fetchPayments)

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error.message })
    }
})

router.post("/payment/manual", async (req, res) => {
    try {
        const { name, mop, amount } = req.body
        const appointment_type = "Walk-In"

        const createManualPayment = await Payment.create({
            name,
            mop,
            amount,
            appointment_type
        })

        res.json({ message: "success", createManualPayment })

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error.message })
    }
})

router.post("/update/status", async (req, res) => {
    try {
        const { id, approval } = req.body

        const appointmentPayment = await Payment.findByPk(id)

        appointmentPayment.status = approval

        await appointmentPayment.save()

        res.status(200).json({ message: 'Payment status updated successfully' });
    } catch (error) {
        console.error(error)
    }
})

router.post("/update/mop", async (req, res) => {
    try {
        const { id, mop } = req.body

        const appointmentPayment = await Payment.findByPk(id)

        appointmentPayment.mop = mop

        await appointmentPayment.save()

        res.status(200).json({ message: 'MOP updated successfully' });
    } catch (error) {
        console.error(error)
    }
})

module.exports = router