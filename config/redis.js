const { createClient } = require('redis');

const redis = createClient({
    url: 'redis://localhost:6379',
});

redis.on('error', (err) => console.error('Redis hatası:', err));

redis.connect().catch((err) => {
    console.error('Redis bağlanamadı:', err.message);
});

module.exports = { redis };
