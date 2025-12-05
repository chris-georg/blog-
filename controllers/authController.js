const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.signup = async (req, res) => {
    const { username, password, email } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Please provide username and password' });
    }

    try {
        // Check if user already exists
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(409).json({ message: 'Username already taken.' });
        }

        // Create new user
        const newUser = new User({ 
            username, 
            password,
            email: email || `${username}@example.com`
        });
        
        await newUser.save();

        // Auto-login after signup
        req.session.userId = newUser._id;
        req.session.username = newUser.username;
        
        req.session.save((err) => {
            if (err) {
                console.error('Session save error during signup:', err);
                return res.status(500).json({ message: 'Signup successful but login failed' });
            }
            
            res.status(201).json({ 
                message: 'User created and logged in successfully.',
                user: { id: newUser._id, username: newUser.username }
            });
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error during signup.' });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Please provide username and password' });
    }

    try {
        console.log('=== LOGIN ATTEMPT ===');
        console.log('Username:', username);

        const user = await User.findOne({ username });
        
        if (!user) {
            console.log('User not found:', username);
            return res.status(401).json({ message: "Invalid credentials" });
        }

        console.log('User found:', user.username, 'ID:', user._id);

        const isMatch = await user.matchPassword(password);
        
        if (!isMatch) {
            console.log('Password mismatch for user:', username);
            return res.status(401).json({ message: "Invalid credentials" });
        }

        console.log('Password verified for user:', username);

        // Set session data
        req.session.userId = user._id;
        req.session.username = user.username;
        req.session.isAdmin = user.isAdmin || false;
        
        console.log('Session data set - UserID:', req.session.userId);
        console.log('Session ID:', req.sessionID);

        // CRITICAL: Save session before sending response
        req.session.save((err) => {
            if (err) {
                console.error('❌ Session save error:', err);
                return res.status(500).json({ message: 'Login failed - session error' });
            }
            
            console.log('✅ Session saved successfully');
            console.log('✅ Login successful for:', user.username);
            
            // Send response AFTER session is saved
            return res.json({ 
                message: "Login Successful",
                user: { 
                    id: user._id, 
                    username: user.username,
                    isAdmin: user.isAdmin || false
                }
            });
        });

    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

exports.logout = (req, res) => {
    console.log('=== LOGOUT ATTEMPT ===');
    console.log('User logging out:', req.session.username || 'Unknown');
    
    req.session.destroy((err) => {
        if (err) {
            console.error('❌ Logout error:', err);
            return res.status(500).json({ message: 'Logout failed' });
        }
        
        // Clear the session cookie
        res.clearCookie('connect.sid', {
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });
        
        console.log('✅ Logout successful');
        return res.json({ message: 'Logout successful' });
    });
};

exports.checkAuth = (req, res) => {
    console.log('=== AUTH CHECK ===');
    console.log('Session ID:', req.sessionID);
    console.log('Session data:', req.session);
    console.log('User ID in session:', req.session.userId);
    
    if (req.session.userId) {
        res.json({ 
            authenticated: true,
            user: {
                id: req.session.userId,
                username: req.session.username,
                isAdmin: req.session.isAdmin || false
            }
        });
    } else {
        res.status(401).json({ 
            authenticated: false,
            message: 'Not authenticated'
        });
    }
};