import redis from 'redis';
import { promisify } from 'util';
import moment from 'moment';
import chalk from 'chalk';
import { mongoose } from '@typegoose/typegoose';
import { mongo } from 'mongoose';

// TODO: ideas to improve redis cache
// in the list save, only persist ids
// when saving a list
// => send a list with complete objects to cache
// => only persists the ids (in order) in the list cache
// => save each item individually in their own cache (saveModelItem)
// when getting a list
// => get the ids order from the list cache
// => re-compute the full list with getModelItem on each element
// Check with a benchmark if this idea is beneficial or not

const enableCache = true;
const logCache = false;

const host = process.env.REDIS_HOST as string ?? '127.0.0.1';
const port = parseInt(process.env.REDIS_PORT as string) ?? 6379;

if (logCache) {
    console.log(chalk.dim('redis host:', host));
    console.log(chalk.dim('redis port:', port));
}

const client = redis.createClient({
    port,
    host,
    password: process.env.REDIS_PASSWORD || ''
});


export const existsAsync = promisify(client.exists).bind(client);

export const getAsync = promisify(client.get).bind(client);
export const setAsync = promisify(client.set).bind(client);
export const delAsync = promisify(client.del).bind(client);

export const lrangeAsync = promisify(client.lrange).bind(client);
export const lpushAsync = promisify(client.lpush).bind(client);
export const rpushAsync = promisify(client.rpush).bind(client);
export const lremAsync = promisify(client.lrem).bind(client);
export const llenAsync = promisify(client.llen).bind(client);
export const hgetAsync = promisify(client.hget).bind(client);
export const hgetAllAsync = promisify(client.hgetall).bind(client);
export const hsetAsync = promisify(client.hset).bind(client);
export const hdelAsync = promisify(client.hdel).bind(client);
export { client };

const objectIdsProperties = ['_id', 'topicId', 'createdBy', 'updatedBy', 'user1', 'user2', 'requestedBy'];
const dateProperties = ['createdAt', 'updatedAt'];
const jsonProperties = ['image', 'picture', 'shares'];

function prepareForSave(object: {[key: string]: any}): {[key: string]: any} {
    log(chalk.dim('prepareForSave', object.id, Object.keys(object)));
    object = Object.assign({}, object);
    for (const key in object) {
      if (objectIdsProperties.includes(key)) {
        object[key] = object[key].toString();
      }
      if (dateProperties.includes(key)) {
        object[key] = moment(object[key]).format();
        log(chalk.magenta(key, ':', object[key]));
      }
      if (jsonProperties.includes(key)) {
        object[key] = JSON.stringify(object[key]);
        log(chalk.magenta(key, ':', object[key]));
      }
    }
    return object;
}

function rehydrate(object: {[key: string]: any, id?: string}): {[key: string]: any, _id?: mongoose.Types.ObjectId} {
  log(chalk.dim('rehydrate', object.id, Object.keys(object)));
//   for (const prop of objectIdsProperties) {
//     if (object[prop]) {
//       object[prop] = new mongoose.Types.ObjectId(object[prop]);
//       log(chalk.magenta(prop, ':', object[prop]));
//     }
//   }
//   for (const prop of dateProperties) {
//     if (object[prop]) {
//       object[prop] = moment(object[prop]).toDate();
//       log(chalk.magenta(prop, ':', object[prop]));
//     }
//   }
  for (const prop of jsonProperties) {
    if (object[prop]) {
      object[prop] = JSON.parse(object[prop]);
      log(chalk.magenta(prop, ':', object[prop]));
    }
  }
  if (object.id) {
    object._id = new mongoose.Types.ObjectId(object.id);
  }
  return object;
}

export async function saveModelItem(collection: string, object: {[key: string]: any, _id?: mongoose.Types.ObjectId}, options?: {time?: number}) {
    if (!enableCache) {
        return;
    }
    if (!object._id) {
        throw new Error('Missing object._id property');
    }
    object = prepareForSave(object);
    for (const key in object) {
      await hsetAsync(`${collection}:${object._id}`, key, object[key]);
      client.expire(`${collection}:${object._id}`, options?.time || 3600 * 12);
    }
  }

export async function getModelItem(collection: string, id: string): Promise<any> {
    if (!enableCache) {
        return null;
    }
  const object = await hgetAllAsync(`${collection}:${id}`);
  if (object) {
    rehydrate(object);
  }
  return object;
}

export async function removeModelItem(collection: string, id: string): Promise<any> {
    if (!enableCache) {
        return;
    }
    await delAsync(`${collection}:${id}`);
}

export async function saveModelItems(key: string, objects: {[key: string]: any}[], options?: {primitive?: boolean, time?: number}) {
    if (!enableCache) {
        return;
    }
  log(chalk.dim('saveModelItems', key, objects.length, 'items'));
  await delAsync(key);
  for (const object of objects) {
    if (options?.primitive) {
        await rpushAsync(key, object);
    } else {
        const preparedObject = prepareForSave(object);
        await rpushAsync(key, JSON.stringify(preparedObject));
    }
  }
  client.expire(key, options?.time || 3600 * 12);
}

export async function getModelItems(key: string, options?: {primitive: boolean}) {
    if (!enableCache) {
        return null;
    }
  log(chalk.dim('getModelItems', key));
  const objects = await lrangeAsync(key, 0, -1);
  if (options?.primitive) {
      return objects;
  }
  if (objects && objects.length) {
    log(chalk.magenta('found', objects.length, 'items'), chalk.dim('getModelItems', key))
    return objects.map((o) => {
        return rehydrate(JSON.parse(o));
    });
  }
}

function log(...args) {
    if (logCache) {
        console.log(...args);
    }
}
