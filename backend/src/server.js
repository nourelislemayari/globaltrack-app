require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { initializePool, closePool } = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const publicRoutes = require('./routes/publicRoutes');
const shipmentsRoutes = require('./routes/shipmentsRoutes');
const statsRoutes = require('./routes/statsRoutes');
const usersRoutes = require('./routes/usersRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use(globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'GlobalTrack API is operational.',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

app.use('/api/public', publicRoutes);

app.use('/api/auth', authLimiter, authRoutes);

app.use('/api/shipments', shipmentsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/users', usersRoutes);

app.use(notFound);
app.use(errorHandler);

async function startServer() {
  try {
    await initializePool();

    const server = app.listen(PORT, () => {
      console.log('\n═══════════════════════════════════════════════════');
      console.log('  🌍 GlobalTrack API Server');
      console.log('═══════════════════════════════════════════════════');
      console.log(`  ✅ Server running on   http://localhost:${PORT}`);
      console.log(`  ✅ Environment:        ${process.env.NODE_ENV || 'development'}`);
      console.log(`  ✅ API Base URL:       http://localhost:${PORT}/api`);
      console.log('═══════════════════════════════════════════════════\n');
    });

    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await closePool();
        console.log('Server shut down.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;

