const { executeQuery, executeTransaction } = require('../config/db');

const VALID_STATUSES = [
  'Registered',
  'In Transit',
  'Customs Inspection',
  'Customs Cleared',
  'Out for Delivery',
  'Delivered',
  'Exception',
  'Returned',
];

function generateTrackingCode() {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `TRK-${num}`;
}

const trackShipment = async (req, res, next) => {
  try {
    const { trackingCode } = req.params;

    if (!trackingCode || trackingCode.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid tracking code.',
      });
    }

    const shipmentResult = await executeQuery(
      `SELECT
         shipment_id,
         tracking_code,
         sender_name,
         receiver_name,
         origin,
         destination,
         current_status,
         estimated_delivery,
         created_at
       FROM SHIPMENTS
       WHERE UPPER(tracking_code) = UPPER(:trackingCode)`,
      { trackingCode: trackingCode.trim() }
    );

    if (!shipmentResult.rows || shipmentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tracking code not found. Please verify and try again.',
        code: 'SHIPMENT_NOT_FOUND',
      });
    }

    const shipment = shipmentResult.rows[0];

    const checkpointResult = await executeQuery(
      `SELECT
         checkpoint_id,
         location,
         status_note,
         checkpoint_time
       FROM CHECKPOINTS
       WHERE shipment_id = :shipmentId
       ORDER BY checkpoint_time ASC`,
      { shipmentId: shipment.SHIPMENT_ID }
    );

    res.status(200).json({
      success: true,
      shipment: {
        shipmentId: shipment.SHIPMENT_ID,
        trackingCode: shipment.TRACKING_CODE,
        senderName: shipment.SENDER_NAME,
        receiverName: shipment.RECEIVER_NAME,
        origin: shipment.ORIGIN,
        destination: shipment.DESTINATION,
        currentStatus: shipment.CURRENT_STATUS,
        estimatedDelivery: shipment.ESTIMATED_DELIVERY,
        createdAt: shipment.CREATED_AT,
      },
      checkpoints: checkpointResult.rows.map((cp) => ({
        checkpointId: cp.CHECKPOINT_ID,
        location: cp.LOCATION,
        statusNote: cp.STATUS_NOTE,
        checkpointTime: cp.CHECKPOINT_TIME,
      })),
    });
  } catch (err) {
    next(err);
  }
};

const getAllShipments = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Whitelist sort columns to prevent SQL injection
    const allowedSortColumns = ['tracking_code', 'current_status', 'estimated_delivery', 'created_at', 'sender_name', 'receiver_name'];
    const safeSortBy = allowedSortColumns.includes(sortBy.toLowerCase()) ? sortBy : 'created_at';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    let whereClause = '';
    const binds = {};

    const conditions = [];
    if (search) {
      conditions.push(`(UPPER(tracking_code) LIKE UPPER(:search) OR UPPER(sender_name) LIKE UPPER(:search) OR UPPER(receiver_name) LIKE UPPER(:search))`);
      binds.search = `%${search}%`;
    }
    if (status) {
      conditions.push(`current_status = :status`);
      binds.status = status;
    }
    if (conditions.length) {
      whereClause = 'WHERE ' + conditions.join(' AND ');
    }

    const countResult = await executeQuery(
      `SELECT COUNT(*) AS total FROM SHIPMENTS ${whereClause}`,
      binds
    );
    const total = countResult.rows[0].TOTAL;

    binds.offset = offset;
    binds.limit = parseInt(limit);

    const shipmentsResult = await executeQuery(
      `SELECT shipment_id, tracking_code, sender_name, receiver_name, origin, destination, current_status, estimated_delivery, created_at
       FROM SHIPMENTS
       ${whereClause}
       ORDER BY ${safeSortBy} ${safeSortOrder}
       LIMIT :limit OFFSET :offset`,
      binds
    );

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      shipments: shipmentsResult.rows.map((s) => ({
        shipmentId: s.SHIPMENT_ID,
        trackingCode: s.TRACKING_CODE,
        senderName: s.SENDER_NAME,
        receiverName: s.RECEIVER_NAME,
        origin: s.ORIGIN,
        destination: s.DESTINATION,
        currentStatus: s.CURRENT_STATUS,
        estimatedDelivery: s.ESTIMATED_DELIVERY,
        createdAt: s.CREATED_AT,
      })),
    });
  } catch (err) {
    next(err);
  }
};

const getShipmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shipmentResult = await executeQuery(
      `SELECT * FROM SHIPMENTS WHERE shipment_id = :id`,
      { id }
    );

    if (!shipmentResult.rows || shipmentResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Shipment not found.' });
    }

    const s = shipmentResult.rows[0];
    const checkpointResult = await executeQuery(
      `SELECT * FROM CHECKPOINTS WHERE shipment_id = :id ORDER BY checkpoint_time ASC`,
      { id }
    );

    res.status(200).json({
      success: true,
      shipment: {
        shipmentId: s.SHIPMENT_ID,
        trackingCode: s.TRACKING_CODE,
        senderName: s.SENDER_NAME,
        receiverName: s.RECEIVER_NAME,
        origin: s.ORIGIN,
        destination: s.DESTINATION,
        currentStatus: s.CURRENT_STATUS,
        estimatedDelivery: s.ESTIMATED_DELIVERY,
        createdAt: s.CREATED_AT,
      },
      checkpoints: checkpointResult.rows.map((cp) => ({
        checkpointId: cp.CHECKPOINT_ID,
        location: cp.LOCATION,
        statusNote: cp.STATUS_NOTE,
        checkpointTime: cp.CHECKPOINT_TIME,
      })),
    });
  } catch (err) {
    next(err);
  }
};

const createShipment = async (req, res, next) => {
  try {
    const { senderName, receiverName, origin, destination, estimatedDelivery } = req.body;

    if (!senderName || !receiverName || !origin || !destination || !estimatedDelivery) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: senderName, receiverName, origin, destination, estimatedDelivery.',
      });
    }

    // Generate unique tracking code (retry if collision)
    let trackingCode;
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 5) {
      trackingCode = generateTrackingCode();
      const check = await executeQuery(
        `SELECT COUNT(*) AS cnt FROM SHIPMENTS WHERE tracking_code = :tc`,
        { tc: trackingCode }
      );
      if (check.rows[0].CNT === 0) isUnique = true;
      attempts++;
    }

    const deliveryDate = new Date(estimatedDelivery).toISOString().slice(0, 10);

    const insertShipmentResult = await executeQuery(
      `INSERT INTO SHIPMENTS (tracking_code, sender_name, receiver_name, origin, destination, current_status, estimated_delivery)
       VALUES (:tracking_code, :sender_name, :receiver_name, :origin, :destination, 'Registered', :estimated_delivery)`,
      {
        tracking_code: trackingCode,
        sender_name: senderName,
        receiver_name: receiverName,
        origin,
        destination,
        estimated_delivery: deliveryDate,
      }
    );
    const newId = insertShipmentResult.insertId;

    await executeQuery(
      `INSERT INTO CHECKPOINTS (shipment_id, location, status_note, checkpoint_time)
       VALUES (:shipment_id, :location, :status_note, CURRENT_TIMESTAMP)`,
      {
        shipment_id: newId,
        location: origin,
        status_note: `Shipment registered at origin: ${origin}.`,
      }
    );

    res.status(201).json({
      success: true,
      message: 'Shipment created successfully.',
      trackingCode,
      shipmentId: newId,
    });
  } catch (err) {
    next(err);
  }
};

const updateShipmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newStatus, location, statusNote } = req.body;

    if (!newStatus || !location || !statusNote) {
      return res.status(400).json({
        success: false,
        message: 'newStatus, location, and statusNote are required.',
      });
    }

    if (!VALID_STATUSES.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid values: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const check = await executeQuery(
      `SELECT shipment_id FROM SHIPMENTS WHERE shipment_id = :id`,
      { id }
    );
    if (!check.rows || check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Shipment not found.' });
    }

    // Atomic transaction: update status + insert checkpoint
    await executeTransaction([
      {
        sql: `UPDATE SHIPMENTS SET current_status = :status WHERE shipment_id = :id`,
        binds: { status: newStatus, id },
      },
      {
        sql: `INSERT INTO CHECKPOINTS (shipment_id, location, status_note, checkpoint_time)
              VALUES (:shipment_id, :location, :status_note, CURRENT_TIMESTAMP)`,
        binds: { shipment_id: id, location, status_note: statusNote },
      },
    ]);

    res.status(200).json({
      success: true,
      message: `Shipment status updated to "${newStatus}".`,
    });
  } catch (err) {
    next(err);
  }
};

const deleteShipment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const check = await executeQuery(
      `SELECT shipment_id FROM SHIPMENTS WHERE shipment_id = :id`,
      { id }
    );
    if (!check.rows || check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Shipment not found.' });
    }

    // Delete checkpoints first (FK constraint), then shipment
    await executeTransaction([
      { sql: `DELETE FROM CHECKPOINTS WHERE shipment_id = :id`, binds: { id } },
      { sql: `DELETE FROM SHIPMENTS WHERE shipment_id = :id`, binds: { id } },
    ]);

    res.status(200).json({ success: true, message: 'Shipment deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  trackShipment,
  getAllShipments,
  getShipmentById,
  createShipment,
  updateShipmentStatus,
  deleteShipment,
};

