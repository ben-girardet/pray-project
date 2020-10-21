import redis from 'redis';
import { promisify } from 'util';

const client = redis.createClient({
    port: parseInt(process.env.REDIS_PORT as string) ?? 6379,
    host: process.env.REDIS_HOST as string ?? '127.0.0.1'
});

export const getAsync = promisify(client.get).bind(client);
export const setAsync = promisify(client.set).bind(client);
export const delAsync = promisify(client.del).bind(client);
export const lrangeAsync = promisify(client.lrange).bind(client);