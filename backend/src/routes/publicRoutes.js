const express = require('express');
const router = express.Router();
const { trackShipment } = require('../controllers/shipmentsController');

router.get('/track/:trackingCode', trackShipment);

module.exports = router;

