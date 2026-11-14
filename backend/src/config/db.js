const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;
let poolInitialization;

const normalizeRows = (rows) => rows.map((row) => {
  const normalized = {};
  Object.keys(row).forEach((key) => {
    normalized[String(key).toUpperCase()] = row[key];
  });
  return normalized;
});

async function initializePool() {
  if (pool) {
    return pool;
  }

  if (!poolInitialization) {
    poolInitialization = (async () => {
      if (!process.env.DB_USER) {
        throw new Error('DB_USER must be configured in backend/.env to connect to MySQL.');
      }

      const newPool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'globaltrack',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        namedPlaceholders: true,
      });

      try {
        await newPool.query('SELECT 1');
      } catch (error) {
        await newPool.end();
        throw error;
      }

      pool = newPool;
      console.log('MySQL database connection established');
      console.log(`   Database: ${process.env.DB_NAME || 'globaltrack'} @ ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
      return pool;
    })();
  }

  try {
    return await poolInitialization;
  } catch (error) {
    poolInitialization = null;
    console.error(' Failed to connect to MySQL:', error.message);
    throw error;
  }
}

async function executeQuery(sql, binds = []) {
  const connectionPool = await initializePool();

  try {
    const [result] = await connectionPool.execute(sql, binds);
    if (Array.isArray(result)) {
      return { rows: normalizeRows(result) };
    }

    return {
      rows: [],
      insertId: result.insertId,
      changes: result.affectedRows,
    };
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
}

async function executeTransaction(statements) {
  const connectionPool = await initializePool();
  const connection = await connectionPool.getConnection();
  const results = [];

  try {
    await connection.beginTransaction();

    for (const { sql, binds = [] } of statements) {
      const [result] = await connection.execute(sql, binds);
      results.push({
        rows: [],
        insertId: result.insertId,
        changes: result.affectedRows,
      });
    }

    await connection.commit();
    return results;
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error('Database rollback error:', rollbackError.message);
    }
    console.error('Database transaction error:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

async function closePool() {
  if (!pool) {
    return;
  }

  const connectionPool = pool;
  pool = null;
  poolInitialization = null;
  await connectionPool.end();
  console.log('MySQL database connection pool closed.');
}

module.exports = { initializePool, executeQuery, executeTransaction, closePool };
