const express = require('express');
const app = express();
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const driverRoutes = require('./routes/driverRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const Driver = require('./models/Driver');
const session = require('express-session');
require('dotenv').config();

// Main database connection
const { connectDB } = require('./utils/mainDB'); 
connectDB(process.env.MONGODB_URI); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'JWT_SECRET',
    resave: false,
    saveUninitialized: true,
}));

// Routes to render different pages
app.get('/', (req, res) => {
    res.render('index', { user: req.user || null });
});

app.get('/driver-dashboard', async (req, res) => {
    try {
        // Retrieve the driver's ID from the session
        const driverId = req.session.driverId;
        if (!driverId) {
            return res.redirect('/driver-login'); // Redirect if not logged in
        }

        // Fetch the full driver object from the database
        const driver = await Driver.findById(driverId);
        if (!driver) {
            return res.status(404).send('Driver not found');
        }

        // Pass the driver object to the view
        res.render('driver-dashboard', { driver });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading driver dashboard');
    }
});

app.get('/emergency-map', (req, res) => {
    res.render('emergency-map'); // assuming emergency-map.ejs is the map page
});

app.get('/department', (req, res) => {
    res.render('department');
});

app.post('/about', (req, res) => {
    res.render('about');
});

app.post('/safety', (req, res) => {
    res.render('safety');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/user-login', (req, res) => {
    res.render('user-login');
});

app.get('/driver-login', (req, res) => {
    res.render('driver-login');
});

app.get('/doctor-login', (req, res) => {
    res.render('doctor-login');
});

// Use routes for user, driver, and doctor
app.use('/user', userRoutes);
app.use('/driver', driverRoutes);
app.use('/doctor', doctorRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
