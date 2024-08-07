require('dotenv').config()
const Pepesan = require("pepesan");
const router = require("./router");
const redisConnect = require("./utils/redisConnect");

const { ALLOWED_NUMBERS } = process.env;

const connectToRedis = async () => {
    console.log("Connecting to Redis...");
    let redis = await redisConnect.connect();
    if (!redis) {
        console.log("Redis connection failed!");
        return null;
    }
    return redis;
};

const main = async () => {
    try {
        const redis = await connectToRedis();
        if (!redis) {
            return; // Exit if Redis connection failed
        }
        
        const config = {
            allowedNumbers: ALLOWED_NUMBERS ? ALLOWED_NUMBERS.split(',') : null,
            browserName: 'Wabot'
        };
        
        const pepesan = Pepesan.init(router, config);
        await pepesan.connect();
    } catch (error) {
        console.error("An error occurred:", error);
    }
};

main();
