const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/db');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'globaltrack-dev-secret';

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const result = await executeQuery(
      `SELECT user_id, full_name, email, password_hash, role, is_active
       FROM USERS
       WHERE LOWER(email) = LOWER(:email)`,
      { email: email.trim() }
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const user = result.rows[0];

    if (user.IS_ACTIVE === 0 || user.IS_ACTIVE === 'N') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact an administrator.',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.PASSWORD_HASH || user.PASSWORD_HASH);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const payload = {
      userId: user.USER_ID,
      fullName: user.FULL_NAME,
      email: user.EMAIL,
      role: user.ROLE,
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        userId: user.USER_ID,
        fullName: user.FULL_NAME,
        email: user.EMAIL,
        role: user.ROLE,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const result = await executeQuery(
      `SELECT user_id, full_name, email, role, created_at
       FROM USERS
       WHERE user_id = :userId`,
      { userId: req.user.userId }
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = result.rows[0];
    res.status(200).json({
      success: true,
      user: {
        userId: user.USER_ID,
        fullName: user.FULL_NAME,
        email: user.EMAIL,
        role: user.ROLE,
        createdAt: user.CREATED_AT,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, getMe };

