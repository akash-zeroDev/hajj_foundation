const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const { clerkMiddleware } = require('@clerk/express');
const dashboardRoutes = require('./routes/dashboardRoutes');
const organisationRoutes = require('./routes/organisationRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const financialRoutes = require('./routes/financialRoutes');
const awardRoutes = require('./routes/awardRoutes');
const bankRoutes = require('./routes/bankRoutes');
const documentRoutes = require('./routes/documentRoutes');
const reportRoutes = require('./routes/reportRoutes');
const auditRoutes = require('./routes/auditRoutes');

const app = express();
app.use(cors());
app.use(express.json());
// Add Clerk middleware to parse incoming auth tokens from React
app.use((req, res, next) => {
  console.log('[Debug Logger] Incoming request:', req.method, req.url);
  console.log('[Debug Logger] Authorization Header:', req.headers.authorization ? req.headers.authorization.substring(0, 20) + '...' : 'NONE');
  next();
});
app.use(clerkMiddleware({ secretKey: process.env.CLERK_SECRET_KEY, publishableKey: process.env.CLERK_PUBLISHABLE_KEY }));
app.use((req, res, next) => {
  console.log('[Debug Logger] req.auth after clerkMiddleware:', req.auth ? 'PRESENT' : 'MISSING', req.auth?.userId || '');
  next();
});

// Routes
// (Old custom auth routes removed since we now use Clerk)
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/organisations', organisationRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/financials', financialRoutes);
app.use('/api/awards', awardRoutes);
app.use('/api/banks', bankRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit-logs', auditRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rbac_db';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (without DB connection)`);
    });
  });
