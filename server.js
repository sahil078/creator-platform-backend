const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// CORS middleware
app.use(cors({
    origin: true,
    credentials: true
  }));
  
  // Handle preflight requests
  app.options('*', cors({
    origin: true,
    credentials: true
  }));
  
  
// Logging requests
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Conditionally apply JSON parsing (avoid parsing on GET to prevent crash)
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    express.json()(req, res, next);
  } else {
    next();
  }
});

app.use(express.urlencoded({ extended: true })); // for form submissions

// 2. ROUTES
const authRoutes = require('./routes/auth');
app.use('/api/v1/auth', authRoutes);

const ideaRoutes = require('./routes/idea');
app.use('/api/v1/ideas', ideaRoutes);

const analyticsRoutes = require('./routes/analytics');
app.use('/api/v1/analytics', analyticsRoutes);

// 3. DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// 4. ERROR HANDLING
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// 5. START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
