import sjcl from 'sjcl';
import { apolloAuth, client } from '../apollo';
import { gql } from 'apollo-boost';
import { customAlphabet } from 'nanoid';
const contentKeyGen = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_.,;:!+*%&/()=?', 10);
// TODO: maybe use another (more modern) crypting solution
// More infos: https://medium.com/sharenowtech/high-speed-public-key-cryptography-in-javascript-part-1-3eefb6f91f77

export class CryptingService {

  public static isCrypted(message: string) {
    if (typeof message === 'string' && message.length > 50 && message.substr(0, 7) === '{"iv":"') {
      return true;
    }
    return false;
  }

  public static encryptString(message: string, cryptingKey: string): string {
    if (CryptingService.isCrypted(message)) {
      return message;
    }
    return sjcl.encrypt(cryptingKey, message);
  }

  public static decryptString(message: string, cryptingKey: string): string {
    if (!CryptingService.isCrypted(message)) {
      return message;
    }
    try {
      return sjcl.decrypt(cryptingKey, message);
    } catch (error) {
      console.warn('Error while trying to decode', message);
      console.error(error);
      throw error;
    }
  }

  public static async decryptTopic(topic: {[key: string]: any, myShare?: {encryptedContentKey?: string, encryptedBy?: string}}): Promise<void> {
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
    topic.name = CryptingService.decryptString(topic.name, contentKey);
    if (topic.messages) {
      for (const message of topic.messages) {
        if (message.text) {
          message.text = CryptingService.decryptString(message.text, contentKey);
        }
      }
    }
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
    topic.name = CryptingService.encryptString(topic.name, contentKey);
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
    topic.name = CryptingService.encryptString(topic.name, contentKey);
    return topic as {[key: string]: any, encryptedContentKey: string};
  }

  public static async encryptNewMessage(topic: {[key: string]: any}, message: string): Promise<string> {
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
    return CryptingService.encryptString(message, contentKey);
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
    `, variables: {id: userId}});
    const encryptedContentKey = await apolloAuth.encrypt(contentKey, encryptedForUser.data.user.publicKey);
    return encryptedContentKey;
  }
}
