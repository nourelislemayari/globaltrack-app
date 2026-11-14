const { executeQuery } = require('../config/db');

const getDashboardStats = async (req, res, next) => {
  try {
    const statsResult = await executeQuery(
      `SELECT
         COUNT(*) AS total_shipments,
         SUM(CASE WHEN current_status NOT IN ('Delivered', 'Returned') THEN 1 ELSE 0 END) AS active_shipments,
         SUM(CASE WHEN current_status = 'Delivered' THEN 1 ELSE 0 END) AS delivered,
         SUM(CASE WHEN current_status IN ('Customs Inspection', 'Customs Cleared') THEN 1 ELSE 0 END) AS in_customs,
         SUM(CASE WHEN current_status = 'In Transit' THEN 1 ELSE 0 END) AS in_transit,
         SUM(CASE WHEN current_status = 'Out for Delivery' THEN 1 ELSE 0 END) AS out_for_delivery,
         SUM(CASE WHEN current_status = 'Exception' THEN 1 ELSE 0 END) AS exceptions,
         SUM(CASE WHEN current_status = 'Registered' THEN 1 ELSE 0 END) AS registered
       FROM SHIPMENTS`
    );

    const recentResult = await executeQuery(
      `SELECT s.tracking_code, s.sender_name, s.receiver_name, s.origin, s.destination, s.current_status, s.estimated_delivery
       FROM SHIPMENTS s
       ORDER BY s.created_at DESC
       LIMIT 5`
    );

    const stats = statsResult.rows[0];

    res.status(200).json({
      success: true,
      stats: {
        totalShipments: stats.TOTAL_SHIPMENTS || 0,
        activeShipments: stats.ACTIVE_SHIPMENTS || 0,
        delivered: stats.DELIVERED || 0,
        inCustoms: stats.IN_CUSTOMS || 0,
        inTransit: stats.IN_TRANSIT || 0,
        outForDelivery: stats.OUT_FOR_DELIVERY || 0,
        exceptions: stats.EXCEPTIONS || 0,
        registered: stats.REGISTERED || 0,
      },
      recentShipments: recentResult.rows.map((s) => ({
        trackingCode: s.TRACKING_CODE,
        senderName: s.SENDER_NAME,
        receiverName: s.RECEIVER_NAME,
        origin: s.ORIGIN,
        destination: s.DESTINATION,
        currentStatus: s.CURRENT_STATUS,
        estimatedDelivery: s.ESTIMATED_DELIVERY,
      })),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboardStats };

