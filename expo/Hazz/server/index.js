const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const { clerkMiddleware } = require('@clerk/express');
const organisationRoutes = require('./routes/organisationRoutes');

const app = express();

app.use(cors());
app.use(express.json());
// Add Clerk middleware to parse incoming auth tokens from React
app.use(clerkMiddleware());

// Routes
// (Old custom auth routes removed since we now use Clerk)
app.use('/api/organisations', organisationRoutes);

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
