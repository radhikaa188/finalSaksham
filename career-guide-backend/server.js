const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const { clerkMiddleware, requireAuth } = require('@clerk/express');

const app = express();

// 1. CORS — sabse pehle
const allowedOrigins = process.env.FRONTEND_URLS.split(',');

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// 2. JSON parsing
app.use(express.json());

// 3. Clerk middleware
app.use(clerkMiddleware());

// 4. MongoDB connect
const connectDB = require('./config/db');
connectDB();

const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

const interestHistoryRoutes = require('./routes/interestHistory');
app.use('/api/interest-history', interestHistoryRoutes);
app.use('/api', limiter);

// 5. Routes
app.use('/api/user', requireAuth(), require('./routes/user'));
app.use('/api/conversation', require('./routes/conversation'));
app.use('/api/agent',   require('./routes/agent'));
app.use('/api/speech',  requireAuth(), require('./routes/speech'));
app.use('/api/career',  requireAuth(), require('./routes/career'));
app.use('/api/courses', requireAuth(), require('./routes/courses'));
app.use('/api/jobs',    requireAuth(), require('./routes/jobs'));

// 6. Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(process.env.PORT || 5000, () => 
  console.log(`Server running on port ${process.env.PORT || 5000}`)
);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong" });
});