const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const ensureAuthenticated = require('../middleware/userLoggedIn');


// Route protected by middleware for accessing the department page
router.get('/department', ensureAuthenticated, (req, res) => {
    res.render('department');
});

// Registration route
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, latitude, longitude, username } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('user-login', { error: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const user = new User({ name, email, username, password: hashedPassword, latitude, longitude });
        await user.save();

        res.render('index', { success: 'Registration successful! Please log in.' });
    } catch (error) {
        console.error(error);
        res.render('user-login', { error: 'An error occurred during registration. Please try again.' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('user-login', { error: 'No account found with this email.' });
        }

        // Compare passwords
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.render('user-login', { error: 'Invalid email or password.' });
        }

        // Set session or token here for the logged-in user
        req.session.user = user;  // Assuming you're using sessions for login

        res.render('index', { success: 'Login successful!', user });
    } catch (error) {
        console.error(error);
        res.render('user-login', { error: 'An error occurred during login. Please try again.' });
    }
});




module.exports = router;
