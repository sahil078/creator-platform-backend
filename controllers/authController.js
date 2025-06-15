const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

// Convert jwt callback functions to promises
const signToken = promisify(jwt.sign);

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Create new user (password gets auto-hashed by pre-save hook)
    const newUser = await User.create({ name, email, password });

    // Generate token
    const token = await signToken(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Remove password from output
    newUser.password = undefined;

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser
      }
    });
  } catch (err) {
    // Handle duplicate email error
    if (err.code === 11000) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email already in use'
      });
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password'
      });
    }

    // 2) Check if user exists and password is correct
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password'
      });
    }

    // 3) Generate token
    const token = await signToken(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // 4) Remove password from output
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  } catch (err) {
    next(err);
  }
};