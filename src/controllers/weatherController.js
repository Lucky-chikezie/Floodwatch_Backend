const { getRainfall } = require('../services/weatherService');

const getWeatherAlert = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const weather = await getRainfall(latitude, longitude);

    const response = {
      ...weather,
      triggerReportPrompt: weather.heavyRainfall,
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getWeatherAlert };