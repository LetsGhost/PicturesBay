import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

let client;

function connectToRedis() {
  try {
    if (!process.env.REDIS_URL) {
      throw new Error('Missing Redis connection string');
    }

    client = createClient({
      url: process.env.REDIS_URL
    });
  
    client.on('error', (err) => {
      console.error('Redis client error', err);
    });
  
    return client.connect()
      .then(() => {
        console.log('Connected to Redis');
      })
      .catch((err) => {
        console.error('Redis connection error', err);
      });
  } catch (err) {
    console.error('Redis connection error', err);
  }
}

export { connectToRedis, client };