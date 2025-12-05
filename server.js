require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const path = require("path");
const cors = require("cors");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");

const app = express();

// Connect to MongoDB
connectDB();

// CORS MUST COME FIRST
app.use(
  cors({
    origin: ["https://blog-yr26.onrender.com", "http://localhost:5000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie", "Set-Cookie"],
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Origin",
    req.headers.origin || "https://blog-yr26.onrender.com"
  );
  next();
});

// Then body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Then session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "none",
      secure: true,
    },
  })
);

// Debug middleware
app.use((req, res, next) => {
  console.log("=== REQUEST DEBUG ===");
  console.log("Path:", req.path);
  console.log("Method:", req.method);
  console.log("Session ID:", req.sessionID);
  console.log("Session User ID:", req.session.userId || "Not set");
  console.log("Cookies:", req.headers.cookie || "None");
  console.log("=====================");
  next();
});

// Test endpoint
app.get("/api/session-test", (req, res) => {
  console.log("=== SESSION TEST ===");
  console.log("Session:", req.session);

  if (!req.session.testVisits) {
    req.session.testVisits = 1;
  } else {
    req.session.testVisits += 1;
  }

  req.session.save((err) => {
    if (err) {
      console.error("Session save error:", err);
      return res.status(500).json({ error: "Session save failed" });
    }

    res.json({
      sessionId: req.sessionID,
      testVisits: req.session.testVisits,
      userId: req.session.userId || "No user",
      message: "Session test successful",
    });
  });
});

// Static files
app.use(express.static(path.join(__dirname, "public")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

// SPA support
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
