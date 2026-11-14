const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getAllUsers, createUser, updateUser, deleteUser } = require('../controllers/usersController');

router.use(authenticate, authorize('ADMIN'));

router.get('/', getAllUsers);
router.post('/', createUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;

