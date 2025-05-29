const axios = require('axios');

const getWeatherFromAPI = async (city) => {
  const apiKey = process.env.WEATHER_API_KEY;
  const baseUrl = process.env.WEATHER_API_URL;

  const url = `${baseUrl}/${encodeURIComponent(city)}?unitGroup=metric&key=${apiKey}&contentType=json`;

  const response = await axios.get(url);
  return response.data;
};

module.exports = { getWeatherFromAPI };
