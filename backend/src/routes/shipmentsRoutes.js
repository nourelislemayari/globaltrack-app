const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getAllShipments,
  getShipmentById,
  createShipment,
  updateShipmentStatus,
  deleteShipment,
} = require('../controllers/shipmentsController');

router.use(authenticate);

router.get('/', getAllShipments);

router.get('/:id', getShipmentById);

router.post('/', createShipment);

router.patch('/:id/status', updateShipmentStatus);

router.delete('/:id', authorize('ADMIN'), deleteShipment);

module.exports = router;

