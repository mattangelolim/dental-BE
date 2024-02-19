const express = require("express")
const router = express.Router()
const Payment = require("../models/payment")
const { Op } = require("sequelize")

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
        res.status(500).json({ message: error.message })
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
        res.status(500).json({ message: error.message })
    }
})

router.get("/revenue/analytics", async (req, res) => {
    try {
        const filter = req.query.filter; // Assuming the filter is sent via query parameters
        const currentDate = new Date();
        const revenueData = [];

        if (filter === 'daily') {
            // Show the data for each day of the current week
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Start of the current week (Sunday)
            startOfWeek.setHours(0, 0, 0, 0);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6); // End of the current week (Saturday)
            endOfWeek.setHours(23, 59, 59, 999);

            for (let i = 0; i < 7; i++) {
                const startDate = new Date(startOfWeek);
                startDate.setDate(startOfWeek.getDate() + i);
                const endDate = new Date(startDate);
                endDate.setHours(23, 59, 59, 999);

                // startDate.setHours(startDate.getHours() + 8);
                // endDate.setHours(endDate.getHours() + 8);

                const dailyRevenue = await Payment.sum('amount', {
                    where: {
                        updatedAt: {
                            [Op.between]: [startDate, endDate]
                        },
                        status: 'Paid'

                    }
                });
                revenueData.push({ date: startDate, revenue: dailyRevenue || 0 });
            }
        } else if (filter === 'weekly') {
            // Show the comparison of each week in the current month
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); // Start of the current month
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0); // End of the current month

            const startOfWeek = new Date(startOfMonth);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(endOfWeek.getDate() + (6 - startOfWeek.getDay())); // End of the first week

            let currentWeekStart = new Date(startOfWeek);
            let currentWeekEnd = new Date(endOfWeek);

            while (currentWeekStart <= endOfMonth) {
                const weeklyRevenue = await Payment.sum('amount', {
                    where: {
                        updatedAt: {
                            [Op.between]: [currentWeekStart, currentWeekEnd]
                        },
                        status: 'Paid'
                    }
                });
                revenueData.push({ week: `${currentWeekStart.getDate()} - ${currentWeekEnd.getDate()}`, revenue: weeklyRevenue || 0 });

                // Move to the next week
                currentWeekStart.setDate(currentWeekEnd.getDate() + 1);
                currentWeekEnd.setDate(currentWeekStart.getDate() + 6);

                // Check if the next week's end date falls into the next month and adjust it if necessary
                if (currentWeekEnd.getMonth() !== startOfMonth.getMonth()) {
                    currentWeekEnd = new Date(currentWeekEnd.getFullYear(), currentWeekEnd.getMonth() + 1, 0);
                }
            }
        } else if (filter === 'monthly') {
            // Show the comparison of each month
            const startOfYear = new Date(currentDate.getFullYear(), 0, 1); // Start of the current year
            const endOfYear = new Date(currentDate.getFullYear(), 11, 31); // End of the current year

            for (let i = 0; i < 12; i++) {
                const startOfMonth = new Date(currentDate.getFullYear(), i, 1); // Start of the month
                const endOfMonth = new Date(currentDate.getFullYear(), i + 1, 0); // End of the month

                const monthlyRevenue = await Payment.sum('amount', {
                    where: {
                        updatedAt: {
                            [Op.between]: [startOfMonth, endOfMonth]
                        },
                        status: 'Paid'
                    }
                });
                revenueData.push({ month: startOfMonth.toLocaleString('en-us', { month: 'long' }), revenue: monthlyRevenue || 0 });
            }
        }
        else if (filter === 'yearly') {
            const startOfYear = new Date(currentDate.getFullYear(), 0, 1); // Start of the current year
            const endOfYear = new Date(currentDate.getFullYear(), 11, 31); // End of the current year

            const yearlyRevenue = await Payment.sum('amount', {
                where: {
                    updatedAt: {
                        [Op.between]: [startOfYear, endOfYear]
                    },
                    status: 'Paid'
                }
            });
            revenueData.push({ year: currentDate.getFullYear(), revenue: yearlyRevenue || 0 });

        } else {
            return res.status(400).json({ message: 'Invalid filter' });
        }

        res.status(200).json({ filter, revenueData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router