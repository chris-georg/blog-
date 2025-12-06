require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const cors = require("cors");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");

const app = express();

// Trust proxy for sessions to work on Render
app.set("trust proxy", 1);

// Connect to MongoDB
connectDB();

// Determine environment
const isProduction = process.env.NODE_ENV === "production";

// CORS Configuration
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "https://blog-yr26.onrender.com",
        "http://localhost:5000",
        "http://localhost:3000",
        "http://localhost:8080",
      ];

      if (
        process.env.NODE_ENV === "development" &&
        origin.includes("localhost")
      ) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin) || origin.includes("onrender.com")) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cookie",
      "Set-Cookie",
      "X-Requested-With",
    ],
    exposedHeaders: ["Set-Cookie"],
  })
);

// Additional CORS headers
app.use((req, res, next) => {
  const allowedOrigins = [
    "https://blog-yr26.onrender.com",
    "http://localhost:5000",
    "http://localhost:3000",
    "http://localhost:8080",
  ];
  const origin = req.headers.origin;

  if (
    origin &&
    (allowedOrigins.includes(origin) ||
      origin.includes("localhost") ||
      origin.includes("onrender.com"))
  ) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie, Set-Cookie"
  );
  next();
});

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    name: "blog.sid",
    secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: isProduction ? "none" : "none", // Allow cross-origin in dev
      secure: false, // Allow non-HTTPS in dev
      httpOnly: true,
      path: "/",
    },
    proxy: true,
  })
);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "blog-api",
    environment: process.env.NODE_ENV || "development",
  });
});

// Static files
app.use(express.static(path.join(__dirname, "public")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

// SPA support - serve index.html for all other routes
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);

  res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.url}`,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Secure cookies: ${isProduction ? "Yes" : "No"}`);
});
