const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const bcrypt = require('bcrypt');
const multer = require('multer');

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Doctor registration route
router.post('/doctor-register', upload.single('profilePicture'), async (req, res) => {
    try {
        const { fullName, email, contact, hospital, password, department } = req.body;
        
        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(password, 10);

        const profilePicture = {
            data: req.file.buffer,
            contentType: req.file.mimetype
        };

        const newDoctor = new Doctor({
            fullName,
            email,
            contact,
            hospital,
            password: hashedPassword,  // Save the hashed password
            department,
            profilePicture
        });

        await newDoctor.save();
        res.redirect('/doctor-login'); // Redirect or send response as needed
    } catch (error) {
        console.error(error);
        res.status(500).send('Error registering doctor');
    }
});

// Doctor login route
router.post('/doctor-login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the doctor by email
        const doctor = await Doctor.findOne({ email });
        if (!doctor) {
            return res.status(400).send('Doctor not found. Please register first.');
        }

        // Check password
        const isMatch = await bcrypt.compare(password, doctor.password);
        if (!isMatch) {
            return res.status(400).send('Invalid password. Please try again.');
        }

        // Password matched, set up session or JWT as per your authentication system
        req.session.doctorId = doctor._id; // If using sessions
        res.redirect('/doctor/dashboard'); // Redirect or send success response as needed
    } catch (error) {
        console.error(error);
        res.status(500).send('Error logging in');
    }
});

module.exports = router;
