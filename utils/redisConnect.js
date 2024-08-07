// import the redis client
const redis = require("redis")

const redisConfig = {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379
}

const redisConnect = redis.createClient(redisConfig)

module.exports = redisConnect