const bcrypt = require('bcryptjs');
const { executeQuery } = require('../config/db');

const SALT_ROUNDS = 10;
const VALID_ROLES = ['ADMIN', 'STAFF'];

const getAllUsers = async (req, res, next) => {
  try {
    const result = await executeQuery(
      `SELECT user_id, full_name, email, role, is_active, created_at
       FROM USERS
       ORDER BY created_at DESC`
    );

    res.status(200).json({
      success: true,
      users: result.rows.map((u) => ({
        userId: u.USER_ID,
        fullName: u.FULL_NAME,
        email: u.EMAIL,
        role: u.ROLE,
        isActive: u.IS_ACTIVE === 1 || u.IS_ACTIVE === 'Y',
        createdAt: u.CREATED_AT,
      })),
    });
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'fullName, email, password, and role are required.',
      });
    }

    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Valid values: ${VALID_ROLES.join(', ')}`,
      });
    }

    const existing = await executeQuery(
      `SELECT COUNT(*) AS cnt FROM USERS WHERE LOWER(email) = LOWER(:email)`,
      { email }
    );
    if (existing.rows[0].CNT > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    await executeQuery(
      `INSERT INTO USERS (full_name, email, password_hash, role)
       VALUES (:full_name, :email, :password_hash, :role)`,
      { full_name: fullName, email: email.toLowerCase(), password_hash: passwordHash, role }
    );

    res.status(201).json({
      success: true,
      message: `Account created for ${fullName}.`,
    });
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, isActive } = req.body;

    // Prevent admin from deactivating their own account
    if (req.user.userId === parseInt(id) && isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account.',
      });
    }

    const check = await executeQuery(
      `SELECT user_id FROM USERS WHERE user_id = :id`,
      { id }
    );
    if (!check.rows || check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const updates = [];
    const binds = { id };

    if (role !== undefined) {
      if (!VALID_ROLES.includes(role)) {
        return res.status(400).json({ success: false, message: `Invalid role.` });
      }
      updates.push(`role = :role`);
      binds.role = role;
    }

    if (isActive !== undefined) {
      updates.push(`is_active = :isActive`);
      binds.isActive = isActive ? 1 : 0;
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update.' });
    }

    await executeQuery(
      `UPDATE USERS SET ${updates.join(', ')} WHERE user_id = :id`,
      binds
    );

    res.status(200).json({ success: true, message: 'User updated successfully.' });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.userId === parseInt(id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account.',
      });
    }

    const check = await executeQuery(
      `SELECT user_id FROM USERS WHERE user_id = :id`,
      { id }
    );
    if (!check.rows || check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await executeQuery(`DELETE FROM USERS WHERE user_id = :id`, { id });

    res.status(200).json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, createUser, updateUser, deleteUser };

