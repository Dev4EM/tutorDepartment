const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const curriculumRoutes=require('./routes/curriculumRoutes.js');
const Program = require('./routes/programRoutes.js');

require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/user');
const batchRoutes=require('./routes/batchRoutes.js');
const taskRoutes=require('./routes/taskRoutes.js');
const sheetRoutes=require('./routes/sheetRoutes.js');
const app = express();
const adminRoutes = require('./routes/adminRoutes');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/curriculum',curriculumRoutes);
app.use('/api/programs',Program);
app.use('/api/admin', adminRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/sheets', sheetRoutes);
app.get('/', (req, res) => {
  res.send('✅ Tutor Dashboard is running');
});
// MongoDB connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI ;

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1); // Exit process on DB connection failure
  });
