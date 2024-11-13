const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Driver = require('../models/Driver');
const multer = require('multer');

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Driver registration route
router.post('/driver-register', upload.single('drivingLicensePhoto'), async (req, res) => {
    try {
        const { name, email, contactNumber, age, password } = req.body;

        // Hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(password, 10);

        const drivingLicensePhoto = {
            data: req.file.buffer,
            contentType: req.file.mimetype
        };

        const newDriver = new Driver({
            name,
            email,
            contactNumber,
            age,
            password: hashedPassword,
            drivingLicensePhoto,
            isActive: false,  // Initially set as inactive
            location: null    // No initial location
        });

        await newDriver.save();
        res.redirect('/driver-login');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error registering driver');
    }
});

// Driver login route
router.post('/driver-login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the driver by email
        const driver = await Driver.findOne({ email });
        if (!driver) {
            return res.status(400).send('Driver not found. Please register first.');
        }

        // Check password
        const isMatch = await bcrypt.compare(password, driver.password);
        if (!isMatch) {
            return res.status(400).send('Invalid password. Please try again.');
        }

        // Password matched, set up session or JWT as per your authentication system
        req.session.driverId = driver._id;
        res.redirect('/driver-dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error logging in');
    }
});

// Route to update driver status and location
router.post('/update-status', async (req, res) => {
    try {
        const { latitude, longitude, isActive } = req.body;
        const driverId = req.session.driverId;

        // Check if driver is authenticated
        if (!driverId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Find and update the driver’s status and location
        const driver = await Driver.findById(driverId);
        if (!driver) {
            return res.status(404).json({ success: false, message: 'Driver not found' });
        }

        // Update the driver's status and location
        driver.isActive = isActive;
        if (isActive) {
            driver.location = { latitude, longitude };
        } else {
            driver.location = null; // Clear location if deactivated
        }

        await driver.save();
        res.json({ success: true, message: `Driver is now ${driver.isActive ? 'active' : 'inactive'}`, driver });
    } catch (error) {
        console.error('Error updating driver status:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;
