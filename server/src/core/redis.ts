import redis from 'redis';
import { promisify } from 'util';

const host = process.env.REDIS_HOST as string ?? '127.0.0.1';
const port = parseInt(process.env.REDIS_PORT as string) ?? 6379;
console.log('redis host:', host);
console.log('redis port:', port);

const client = redis.createClient({
    port,
    host
});


export const getAsync = promisify(client.get).bind(client);
export const setAsync = promisify(client.set).bind(client);
export const delAsync = promisify(client.del).bind(client);
export const lrangeAsync = promisify(client.lrange).bind(client);
export const hgetAsync = promisify(client.hget).bind(client);
export const hgetAllAsync = promisify(client.hgetall).bind(client);
export const hsetAsync = promisify(client.hset).bind(client);
export const hdelAsync = promisify(client.hdel).bind(client);
export { client };
