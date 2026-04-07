// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');
// require('dotenv').config();
// const { clerkMiddleware, requireAuth } = require('@clerk/express');

// const app = express();
// app.get("/", (req, res) => {
//   res.send("Backend is running 🚀");
// });
// // 1. CORS — sabse pehle
// const allowedOrigins = process.env.FRONTEND_URLS.split(',');

// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true
// }));

// // 2. JSON parsing
// app.use(express.json());

// // 3. Clerk middleware
// app.use(clerkMiddleware());

// // 4. MongoDB connect
// const connectDB = require('./config/db');
// connectDB();

// const rateLimit = require('express-rate-limit');
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100
// });

// const interestHistoryRoutes = require('./routes/interestHistory');
// app.use('/api/interest-history', interestHistoryRoutes);
// app.use('/api', limiter);

// // 5. Routes
// app.use('/api/user', requireAuth(), require('./routes/user'));
// app.use('/api/conversation', require('./routes/conversation'));
// app.use('/api/agent',   require('./routes/agent'));
// app.use('/api/speech',  requireAuth(), require('./routes/speech'));
// app.use('/api/career',  requireAuth(), require('./routes/career'));
// app.use('/api/courses', requireAuth(), require('./routes/courses'));
// app.use('/api/jobs',    requireAuth(), require('./routes/jobs'));

// // 6. Health check

// app.get('/health', (req, res) => res.json({ status: 'ok' }));
// app.get('/api/ping', (req, res) => res.json({ ok: true })); // ← ADD THIS
// app.listen(process.env.PORT || 5000, () => 
//   console.log(`Server running on port ${process.env.PORT || 5000}`)
// );
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ error: "Something went wrong" });
// });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const { clerkMiddleware, requireAuth } = require('@clerk/express');

const app = express();

// ------------------ 1. CORS ------------------
// Allow local dev and future frontend URLs (for Render)
const allowedOrigins = [
  'http://localhost:5173', // Vite default port
  'http://localhost:5174'  // your current frontend
];

// If you have production frontend URLs, add via env
if (process.env.FRONTEND_URLS) {
  allowedOrigins.push(...process.env.FRONTEND_URLS.split(','));
}

app.use(cors({
  origin: function(origin, callback) {
    // allow non-browser tools like Postman
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'], // ← PATCH added
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ------------------ 2. JSON parsing ------------------
app.use(express.json());

// ------------------ 3. Clerk middleware ------------------
app.use(clerkMiddleware());

// ------------------ 4. MongoDB connect ------------------
const connectDB = require('./config/db');
connectDB();

// ------------------ 5. Rate limiter ------------------
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100
});

// ------------------ 6. Routes ------------------
const interestHistoryRoutes = require('./routes/interestHistory');
app.use('/api/interest-history', interestHistoryRoutes);
app.use('/api', limiter);

app.use('/api/user', requireAuth(), require('./routes/user'));
app.use('/api/conversation', require('./routes/conversation'));
app.use('/api/agent', require('./routes/agent'));
app.use('/api/speech', requireAuth(), require('./routes/speech'));
app.use('/api/career', requireAuth(), require('./routes/career'));
app.use('/api/courses', requireAuth(), require('./routes/courses'));
app.use('/api/jobs', requireAuth(), require('./routes/jobs'));

// ------------------ 7. Health check ------------------
app.get("/", (req, res) => res.send("Backend is running 🚀"));
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/ping', (req, res) => res.json({ ok: true }));

// ------------------ 8. Error handler ------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong" });
});

// ------------------ 9. Start server ------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));