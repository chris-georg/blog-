const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");

const app = express(); 

connectDB();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: 'false',
    cookie: { 
        secure: process.env.NODE_ENV === 'production', // HTTPS in production
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(cors({
  origin: true, // Allow all origins for now
  credentials: true, // Allow credentials (cookies, authorization headers)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow necessary methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Allow necessary headers
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})