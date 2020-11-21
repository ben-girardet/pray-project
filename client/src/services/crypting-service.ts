import sjcl from 'sjcl';
import { apolloAuth, client } from '../apollo';
import { gql } from 'apollo-boost';
import { customAlphabet } from 'nanoid';
// import 'reflect-metadata';
const contentKeyGen = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_.,;:!+*%&/()=?', 10);
// TODO: maybe use another (more modern) crypting solution
// More infos: https://medium.com/sharenowtech/high-speed-public-key-cryptography-in-javascript-part-1-3eefb6f91f77

export class CryptingService {

  public static encryptObject(obj: {[key: string]: any}, properties: string[], cryptingKey: string): void {
    for (const key of properties) {
      if (obj[key] !== undefined && typeof obj[key] === 'string') {
        obj[key] = sjcl.encrypt(cryptingKey, obj[key] as string);
      }
    }
  }

  public static decryptObject(obj: {[key: string]: any}, properties: string[], cryptingKey: string): any {
    for (const key of properties) {
      if (typeof obj[key] === 'string') {
        try {
          const decrypted = sjcl.decrypt(cryptingKey, obj[key]);
          obj[key] = decrypted;
        } catch (error) {
          console.warn('Error while trying to decode', obj[key]);
          console.error(error);
          throw new Error('Access denied');
        }
      }
    }
  }

  public static async decryptTopic(topic: {[key: string]: any, myShare?: {encryptedContentKey?: string, encryptedBy?: string}}): Promise<any> {
    const isDescrypted = Reflect.getMetadata('decrypted', topic);
    if (isDescrypted) {
      return;
    }
    const user = await client.query<{user: {publicKey: string}}>({query: gql`
query UserPubKey($id: String!) {
  user(id: $id) {
    id,
    publicKey
  }
}
    `, variables: {id: topic.myShare.encryptedBy}});
    const publicKey = user.data.user.publicKey;
    const contentKey = await apolloAuth.decrypt(topic.myShare.encryptedContentKey, publicKey);
    CryptingService.decryptObject(topic, ['name', 'description'], contentKey);
    Reflect.defineMetadata('decrypted', true, topic);
  }

  public static async encryptEditedTopic(topic: {[key: string]: any, myShare?: {encryptedContentKey?: string, encryptedBy?: string}}): Promise<any> {
    const user = await client.query<{user: {publicKey: string}}>({query: gql`
query UserPubKey($id: String!) {
  user(id: $id) {
    id,
    publicKey
  }
}
    `, variables: {id: topic.myShare.encryptedBy}});
    const publicKey = user.data.user.publicKey;
    const contentKey = await apolloAuth.decrypt(topic.myShare.encryptedContentKey, publicKey);
    CryptingService.encryptObject(topic, ['name', 'description'], contentKey);
    return topic;
  }

  public static async encryptNewTopic(topic: {[key: string]: any}): Promise<{[key: string]: any, encryptedContentKey: string}> {
    const user = await client.query<{user: {publicKey: string}}>({query: gql`
query UserPubKey($id: String!) {
  user(id: $id) {
    id,
    publicKey
  }
}
    `, variables: {id: apolloAuth.getUserId()}});
    const publicKey = user.data.user.publicKey;
    const contentKey = contentKeyGen();
    topic.encryptedContentKey = await apolloAuth.encrypt(contentKey, publicKey);
    CryptingService.encryptObject(topic, ['name', 'description'], contentKey);
    return topic as {[key: string]: any, encryptedContentKey: string};
  }

  public static async recryptContentKeyFor(myShare: {encryptedContentKey?: string, encryptedBy?: string}, userId: string) {
    const encryptedByUser = await client.query<{user: {publicKey: string}}>({query: gql`
query UserPubKey($id: String!) {
  user(id: $id) {
    id,
    publicKey
  }
}
    `, variables: {id: myShare.encryptedBy}});
    const contentKey = await apolloAuth.decrypt(myShare.encryptedContentKey, encryptedByUser.data.user.publicKey);
    const encryptedForUser = await client.query<{user: {publicKey: string}}>({query: gql`
query UserPubKey($id: String!) {
  user(id: $id) {
    id,
    publicKey
  }
}
    `, variables: {id: myShare.encryptedBy}});
    const encryptedContentKey = await apolloAuth.encrypt(contentKey, encryptedForUser.data.user.publicKey);
    return encryptedContentKey;
  }
}