require('dotenv').config();
const express = require('express');
const { createClient } = require('redis');
const { getWeatherFromAPI } = require('./utils/weatherService');

const app = express();
const port = process.env.PORT || 5100;
const redisUrl = process.env.REDIS_URL;
const ttl = parseInt(process.env.CACHE_TTL_SECONDS, 10);

// Redis client setup
const redisClient = createClient({ url: redisUrl });
redisClient.connect().catch(console.error);

app.get('/weather/:city', async (req, res) => {
  const city = req.params.city.toLowerCase();

  try {
    // 1. Check cache
    const cachedData = await redisClient.get(city);
    if (cachedData) {
      console.log(`Cache hit for ${city}`);
      return res.json(JSON.parse(cachedData));
    }

    // 2. Request from 3rd party
    const weatherData = await getWeatherFromAPI(city);

    // 3. Cache response with TTL
    await redisClient.set(city, JSON.stringify(weatherData), {
      EX: ttl,
    });

    // 4. Return response
    res.json(weatherData);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

app.listen(port, () => {
  console.log(`Weather API Wrapper running on http://localhost:${port}`);
});
