const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User'); 
const jwt = require('jsonwebtoken');
// Signup
router.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, workEmail, password } = req.body;

    // Basic input validation
    if (!firstName || !lastName || !workEmail || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ workEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      ...req.body,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// Login
router.post('/login', async (req, res) => {
  try {
    const { workEmail, password } = req.body;

    const user = await User.findOne({ workEmail });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // ✅ Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        workEmail: user.workEmail,
        userType: user.userType, // optionally include roles
      },
      process.env.JWT_SECRET || 'default_secret', // fallback for local dev
      {
        expiresIn: '1d', // 1 day expiry
      }
    );

    // ✅ Respond with token and user data (excluding password)
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        workEmail: user.workEmail,
        userType: user.userType,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Forget Password (reset with new password - no email token)
router.post('/forgot-password', async (req, res) => {
  try {
    const { workEmail, newPassword } = req.body;

    if (!workEmail || !newPassword) {
      return res.status(400).json({ message: 'workEmail and newPassword are required' });
    }

    const user = await User.findOne({ workEmail });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// Get user by ID
// 1️⃣ Get all tutors (id + name)
router.get('/tutors', async (req, res) => {
  try {
    const tutors = await User.find().select('firstName lastName _id');
    const tutorList = tutors.map(tutor => ({
      id: tutor._id,
      name: `${tutor.firstName} ${tutor.lastName}`,
    }));
    res.status(200).json(tutorList);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 2️⃣ Get user by ID (keep this after /tutors)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// Update user profile
router.put('/:id', async (req, res) => {
  try {
    const { password, ...updateFields } = req.body;

    // If password is included, hash it
    if (password) {
      updateFields.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'User updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const result = await User.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
