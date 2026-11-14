const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ERROR:`, err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'A record with this identifier already exists.',
      code: 'DUPLICATE_ENTRY',
    });
  }
  if (err.code === 'ER_BAD_NULL_ERROR' || err.code === 'ER_NO_DEFAULT_FOR_FIELD') {
    return res.status(400).json({
      success: false,
      message: 'Required field is missing.',
      code: 'NULL_CONSTRAINT',
    });
  }
  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({
      success: false,
      message: 'Cannot complete this operation because related records exist.',
      code: 'FK_CONSTRAINT',
    });
  }
  if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED' || err.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD') {
    return res.status(400).json({
      success: false,
      message: 'The submitted data violates a database constraint.',
      code: 'DB_CONSTRAINT',
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: err.message,
      code: 'VALIDATION_ERROR',
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected server error occurred.',
    code: 'SERVER_ERROR',
  });
};

const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
    code: 'NOT_FOUND',
  });
};

module.exports = { errorHandler, notFound };

