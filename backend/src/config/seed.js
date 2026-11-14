require('dotenv').config();
const { initializePool, executeQuery, closePool } = require('./db');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

async function seedDatabase() {
  let failed = false;

  try {
    console.log('Starting database seed...\n');
    await initializePool();

    console.log(' Seeding users...');
    const adminHash = await bcrypt.hash('Admin@1234', SALT_ROUNDS);
    const staffHash = await bcrypt.hash('Staff@1234', SALT_ROUNDS);

    const users = [
      { full_name: 'System Administrator', email: 'admin@globaltrack.com', password_hash: adminHash, role: 'ADMIN' },
      { full_name: 'Sarah Mitchell', email: 'sarah.mitchell@globaltrack.com', password_hash: staffHash, role: 'STAFF' },
      { full_name: 'James Okonkwo', email: 'james.okonkwo@globaltrack.com', password_hash: staffHash, role: 'STAFF' },
    ];

    for (const user of users) {
      await executeQuery(
        `INSERT INTO USERS (full_name, email, password_hash, role)
         VALUES (:full_name, :email, :password_hash, :role)
         ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
        user
      );
    }
    console.log(`    ${users.length} sample users processed.\n`);

    console.log('📦 Seeding shipments...');
    const shipments = [
      {
        tracking_code: 'TRK-983214',
        sender_name: 'Alibaba Trade Co.',
        receiver_name: 'Pierre Dubois',
        origin: 'Shanghai, China',
        destination: 'Paris, France',
        current_status: 'In Transit',
        estimated_delivery: new Date('2026-11-15'),
      },
      {
        tracking_code: 'TRK-774501',
        sender_name: 'TexMex Exports LLC',
        receiver_name: 'Mohamed Al-Rashid',
        origin: 'Houston, USA',
        destination: 'Dubai, UAE',
        current_status: 'Customs Inspection',
        estimated_delivery: new Date('2026-11-10'),
      },
      {
        tracking_code: 'TRK-112938',
        sender_name: 'BMW Parts GmbH',
        receiver_name: 'Carlos Mendoza',
        origin: 'Munich, Germany',
        destination: 'Bogotá, Colombia',
        current_status: 'Delivered',
        estimated_delivery: new Date('2026-10-28'),
      },
      {
        tracking_code: 'TRK-558826',
        sender_name: 'Tokyo Electronics Ltd.',
        receiver_name: 'Aisha Nkrumah',
        origin: 'Tokyo, Japan',
        destination: 'Lagos, Nigeria',
        current_status: 'Registered',
        estimated_delivery: new Date('2026-11-20'),
      },
      {
        tracking_code: 'TRK-329047',
        sender_name: 'London Fashion House',
        receiver_name: 'Priya Sharma',
        origin: 'London, UK',
        destination: 'Mumbai, India',
        current_status: 'Out for Delivery',
        estimated_delivery: new Date('2026-11-04'),
      },
    ];

    for (const s of shipments) {
      await executeQuery(
        `INSERT IGNORE INTO SHIPMENTS (tracking_code, sender_name, receiver_name, origin, destination, current_status, estimated_delivery)
         VALUES (:tracking_code, :sender_name, :receiver_name, :origin, :destination, :current_status, :estimated_delivery)`,
        s
      );
    }
    console.log(`    ${shipments.length} sample shipments processed.\n`);

    console.log('📍 Seeding checkpoints...');

    // Fetch shipment IDs for FK reference
    const result = await executeQuery('SELECT shipment_id, tracking_code FROM SHIPMENTS ORDER BY shipment_id');
    const shipmentMap = {};
    for (const row of result.rows) {
      shipmentMap[row.TRACKING_CODE] = row.SHIPMENT_ID;
    }

    const checkpoints = [
      { tracking_code: 'TRK-983214', location: 'Shanghai Port, China', status_note: 'Shipment registered and received at origin warehouse.', checkpoint_time: new Date('2026-10-25T08:00:00') },
      { tracking_code: 'TRK-983214', location: 'Shanghai International Airport', status_note: 'Cargo loaded onto flight CX-823 bound for Frankfurt.', checkpoint_time: new Date('2026-10-27T14:30:00') },
      { tracking_code: 'TRK-983214', location: 'Frankfurt Hub, Germany', status_note: 'Arrived at European transit hub. Connecting flight scheduled.', checkpoint_time: new Date('2026-10-28T22:00:00') },
      { tracking_code: 'TRK-983214', location: 'Paris CDG Airport, France', status_note: 'Arrived in Paris. In transit to customs facility.', checkpoint_time: new Date('2026-10-30T06:15:00') },
      { tracking_code: 'TRK-774501', location: 'Houston Export Terminal, USA', status_note: 'Cargo registered. Export documentation verified.', checkpoint_time: new Date('2026-10-28T09:00:00') },
      { tracking_code: 'TRK-774501', location: 'Houston Intercontinental Airport', status_note: 'Departed Houston on Emirates cargo flight.', checkpoint_time: new Date('2026-10-30T18:00:00') },
      { tracking_code: 'TRK-774501', location: 'Dubai International Airport, UAE', status_note: 'Arrived. Awaiting customs inspection.', checkpoint_time: new Date('2026-11-01T07:45:00') },
      { tracking_code: 'TRK-774501', location: 'Dubai Customs Authority', status_note: 'Customs inspection in progress. Duties being assessed.', checkpoint_time: new Date('2026-11-02T10:00:00') },
      { tracking_code: 'TRK-112938', location: 'Munich Logistics Center, Germany', status_note: 'Shipment registered at origin.', checkpoint_time: new Date('2026-10-10T08:00:00') },
      { tracking_code: 'TRK-112938', location: 'Frankfurt Airport, Germany', status_note: 'Departed Germany on Lufthansa Cargo.', checkpoint_time: new Date('2026-10-12T15:00:00') },
      { tracking_code: 'TRK-112938', location: 'Bogotá Airport, Colombia', status_note: 'Arrived in Colombia. Customs cleared.', checkpoint_time: new Date('2026-10-14T04:30:00') },
      { tracking_code: 'TRK-112938', location: 'Bogotá Distribution Center', status_note: 'Package out for final delivery.', checkpoint_time: new Date('2026-10-27T08:00:00') },
      { tracking_code: 'TRK-112938', location: 'Bogotá, Colombia', status_note: 'Package delivered. Signed by recipient.', checkpoint_time: new Date('2026-10-28T11:30:00') },
      { tracking_code: 'TRK-558826', location: 'Tokyo Warehouse, Japan', status_note: 'Order registered. Awaiting packaging.', checkpoint_time: new Date('2026-11-02T12:00:00') },
      { tracking_code: 'TRK-329047', location: 'London Heathrow, UK', status_note: 'Shipment registered and dispatched.', checkpoint_time: new Date('2026-10-29T09:00:00') },
      { tracking_code: 'TRK-329047', location: 'Doha Transit Hub, Qatar', status_note: 'Transit stop. Reloaded on Mumbai-bound flight.', checkpoint_time: new Date('2026-11-01T03:00:00') },
      { tracking_code: 'TRK-329047', location: 'Mumbai Airport, India', status_note: 'Arrived Mumbai. Customs cleared. Dispatched to local courier.', checkpoint_time: new Date('2026-11-02T14:00:00') },
      { tracking_code: 'TRK-329047', location: 'Mumbai, India', status_note: 'Package with local delivery agent. Delivery attempt today.', checkpoint_time: new Date('2026-11-03T09:00:00') },
    ];

    for (const cp of checkpoints) {
      const shipment_id = shipmentMap[cp.tracking_code];
      const binds = { shipment_id, location: cp.location, status_note: cp.status_note };
      const existing = await executeQuery(
        `SELECT checkpoint_id FROM CHECKPOINTS
         WHERE shipment_id = :shipment_id AND location = :location AND status_note = :status_note
         LIMIT 1`,
        binds
      );

      if (existing.rows.length > 0) {
        continue;
      }

      await executeQuery(
        `INSERT INTO CHECKPOINTS (shipment_id, location, status_note, checkpoint_time)
         VALUES (:shipment_id, :location, :status_note, :checkpoint_time)`,
        { shipment_id, location: cp.location, status_note: cp.status_note, checkpoint_time: cp.checkpoint_time }
      );
    }
    console.log(`   ✅ ${checkpoints.length} sample checkpoints processed.\n`);

    console.log('🎉 Database seeding completed successfully!\n');
    console.log('Default credentials:');
    console.log('  Admin:  admin@globaltrack.com  /  Admin@1234');
    console.log('  Staff:  sarah.mitchell@globaltrack.com  /  Staff@1234');

  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    failed = true;
  } finally {
    try {
      await closePool();
    } catch (err) {
      console.error('❌ Failed to close the database:', err.message);
      failed = true;
    }

    if (failed) {
      process.exitCode = 1;
    }
  }
}

seedDatabase();

