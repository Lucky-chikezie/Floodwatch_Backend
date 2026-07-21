const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./src/config/db');
const reportRoutes = require('./src/routes/reportRoutes');
const startDecayJob = require('./src/services/decayService');
const weatherRoutes = require ('./src/routes/weatherRoutes');

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use('/api/reports', reportRoutes);
app.use('/api/weather', weatherRoutes);

app.get('/', (req, res) => {
  res.send('FloodWatch API is running');
});

const PORT = process.env.PORT || 5000;

connectDB();
startDecayJob();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});