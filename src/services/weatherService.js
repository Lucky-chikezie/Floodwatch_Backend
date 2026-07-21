const axios = require('axios');

const getRainfall = async (latitude, longitude) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;

  const response = await axios.get(url);
  const data = response.data;

  const rainVolume = data.rain ? data.rain['1h'] || 0 : 0;

  return {
    location: data.name,
    temperature: data.main.temp,
    condition: data.weather[0].main,
    description: data.weather[0].description,
    rainVolumeLastHour: rainVolume,
    heavyRainfall: rainVolume > 10, // threshold in mm, adjustable
  };
};

module.exports = { getRainfall };