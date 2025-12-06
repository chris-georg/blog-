module.exports = function (req, res, next) {
  console.log("=== AUTH MIDDLEWARE CHECK ===");
  console.log("Session ID:", req.sessionID);
  console.log(
    "Session userId:",
    req.session ? req.session.userId : "No session"
  );
  console.log("Full session:", req.session);
  console.log("Cookies:", req.headers.cookie);

  if (req.session && req.session.userId) {
    console.log("✅ Auth passed for user:", req.session.userId);
    return next();
  } else {
    console.log("❌ Auth failed - no session or userId");
    return res.status(401).json({
      message: "Not authorized. Please login again.",
      requiresLogin: true,
    });
  }
};
