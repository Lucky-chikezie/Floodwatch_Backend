const express = require('express');
const router = express.Router();
const { getWeatherAlert } = require('../controllers/weatherController');

router.get('/', getWeatherAlert);

module.exports = router;