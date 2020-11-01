import { inject } from 'aurelia';
import { IUserTopic, SeaPair, ITopic, GunService, CryptingService } from './internals';
import { customAlphabet }  from 'nanoid';

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 24)
const nanoid2 = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_.,;:!+*%&/()=?', 10);

@inject()
export class GunTopic {

  public static cryptedProperties = ['title', 'description', 'thumbnail', 'previewSrc', 'imageSrc'];

  public constructor(private gunService: GunService) {
    
  }

  public async getUserTopics(userId: string): Promise<IUserTopic[]> {
    const userTopics: IUserTopic[] = [];
    const test = await this.gunService.gun.get('users').get(userId).get('userTopics').then();
    if (!test) {
      return [];
    }

    await this.gunService.gun.get('users').get(userId).get('userTopics').once().map().once((data) => {
      userTopics.push(data);
    }).then();
    return userTopics;
  }

  public async getTopics(userId: string, pair: SeaPair, order = '-lastUpdateDate', status: 'active' | 'answered' | 'archived' | 'all'): Promise<ITopic[]> {
    const userTopics: IUserTopic[] = await this.getUserTopics(userId);
    if (!userTopics.length) {
      return [];
    }
    this.gunService.sort(userTopics, 'id');
    const topics: ITopic[] = [];
    for (const userTopic of userTopics) {
      if (!userTopic) { // can happen when a relation has been nullified
        continue;
      }
      const encryptedContentKey = userTopic.encryptedContentKey;
      const encryptedBy = userTopic.encryptedBy;
      const writerPub = await this.gunService.gun.get('users').get(encryptedBy).once().get('pubKey').then();
      const decryptedContentKey = await this.gunService.decryptWithPair(encryptedContentKey, pair, writerPub);
      let t: any;
      try {
        t = await this.gunService.gun.get('usersTopics').get(userTopic.id).get('topic').then();
      } catch (error) {
        console.error(error);
      }
      const topic = Object.assign({}, t);
      if (Object.keys(topic).length === 0) {
        continue; // can happen when a relation has been nullified
      }
      if (status !== 'all' && topic.status !== status) {
        continue;
      }
      CryptingService.decryptObject(topic, GunTopic.cryptedProperties, decryptedContentKey);
      topics.push(topic as ITopic);
    }
    this.gunService.sort(topics, order);
    return topics;
  }

  public async getTopic(userId: string, topicId: string, pair: SeaPair): Promise<ITopic> {
    const topicChainRef = this.gunService.gun.get('topics').get(topicId);
    const topic = Object.assign({}, await topicChainRef.then());
    const userTopic = await topicChainRef.get('userTopics').get(userId).then();
    if (!userTopic) {
      throw new Error('Access denied');
    }
    const encryptedContentKey = userTopic.encryptedContentKey;
    const encryptedBy = userTopic.encryptedBy;
    const writerPub = await this.gunService.gun.get('users').get(encryptedBy).once().get('pubKey').then();
    const decryptedContentKey = await this.gunService.decryptWithPair(encryptedContentKey, pair, writerPub);
    CryptingService.decryptObject(topic, GunTopic.cryptedProperties, decryptedContentKey);
    return topic;
  }

  public async createTopic(userId: string, topic: ITopic, pair: SeaPair): Promise<ITopic> {
    delete topic.userTopics;
    delete topic.topicMessages;
    if (!topic.id) {
      topic.id = nanoid();
    }
    if (!topic.status) {
      topic.status = 'active';
    }
    topic.author = userId;
    const user = await this.gunService.gun.get('users').get(userId).then();
    const writerPub = user.pubKey;
    const nonCryptedContentKey = nanoid2();
    const encryptedContentKey = await this.gunService.encryptWithPair(nonCryptedContentKey, pair, writerPub);
    this.gunService.changeIdentity(topic, userId);
    CryptingService.encryptObject(topic, GunTopic.cryptedProperties, nonCryptedContentKey);
    const createdTopic = await this.gunService.gun.get('topics').get(topic.id).put(topic).then();
    // link to user
    const userTopic: IUserTopic = {
      id: nanoid(),
      user: user,
      topic: createdTopic,
      encryptedContentKey: encryptedContentKey,
      encryptedBy: userId
    };
    const relation = await this.gunService.gun.get('usersTopics').get(userTopic.id).put(userTopic).then();
    await this.gunService.gun.get('users').get(userId).get('userTopics').get(topic.id).put(relation);
    await this.gunService.gun.get('topics').get(topic.id).get('userTopics').get(userId).put(relation);
    return createdTopic;
  }

  public async addShare(topicId: string, writerUserId: string, writerPair: SeaPair, newShareUserId: string): Promise<boolean> {
    // first read the topic
    // if it doesn't fail it means that the writer user can read it and have access
    await this.getTopic(writerUserId, topicId, writerPair);
    // check if a relation with the newShare already exists
    const existing = await this.gunService.gun.get('topics').get(topicId).get('userTopics').get(newShareUserId).then();
    if (existing) {
      throw new Error('Topic is already shared with this user');
    }
    // fetch newShare user
    const user = await this.gunService.gun.get('users').get(newShareUserId).then();
    if (!user) {
      throw new Error('User not found');
    }
    const sharedTopic = await this.gunService.gun.get('topics').get(topicId).then();
    // create a new encryptedContentKey for the new share
    const current = await this.gunService.gun.get('topics').get(topicId).get('userTopics').get(writerUserId).then();
    const writerPub = await this.gunService.gun.get('users').get(current.encryptedBy).once().get('pubKey').then();
    const decryptedContentKey = await this.gunService.decryptWithPair(current.encryptedContentKey, writerPair, writerPub);
    const encryptedContentKey = await this.gunService.encryptWithPair(decryptedContentKey, writerPair, user.pubKey);
    
    // link to user
    const userTopic: IUserTopic = {
      id: nanoid(),
      user: user,
      topic: sharedTopic,
      encryptedContentKey: encryptedContentKey,
      encryptedBy: writerUserId
    };
    const relation = await this.gunService.gun.get('usersTopics').get(userTopic.id).put(userTopic).then();
    await this.gunService.gun.get('users').get(newShareUserId).get('userTopics').get(topicId).put(relation);
    await this.gunService.gun.get('topics').get(topicId).get('userTopics').get(newShareUserId).put(relation);
    return true;
  }

  public async removeShare(topicId: string, writerUserId: string, writerPair: SeaPair, oldShareUserId: string): Promise<true> {
    // first read the topic
    // if it doesn't fail it means that the writer user can read it and have access
    await this.getTopic(writerUserId, topicId, writerPair);
    // check if a relation with the oldShare actually exists
    const existing = await this.gunService.gun.get('topics').get(topicId).get('userTopics').get(oldShareUserId).then();
    if (!existing) {
      throw new Error('Topic is not shared with this user');
    }
    // remove the share
    // FIXME: seems that something is not properly removed (delete, nullified) here
    await this.gunService.gun.get('topics').get(topicId).get('userTopics').get(oldShareUserId).put(null);
    await this.gunService.gun.get('usersTopics').get(existing.id).put(null);
    // TODO: crypt with a new key
    return true;
  }

  public async recryptTopic(topicId: string, userId: string, pair: SeaPair): Promise<boolean> {
    // first read the topic
    // if it doesn't fail it means that the writer user can read it and have access
    const topic = await this.getTopic(userId, topicId, pair);
    const newContentKey = nanoid2();
    CryptingService.encryptObject(topic, GunTopic.cryptedProperties, newContentKey);
    this.gunService.gun.get('topics').get(topicId).put(topic);
    const userTopics: Array<IUserTopic> = [];
    await this.gunService.gun.get('topics').get(topicId).get('userTopics').once().map().once(async (data) => {
      userTopics.push(data);
    }).then();
    for (const userTopic of userTopics) {
      const pub = await this.gunService.gun.get('usersTopics').get(userTopic.id).get('user').once().get('pubKey').then() as string;
      userTopic.encryptedContentKey = await this.gunService.encryptWithPair(newContentKey, pair, pub);
      await this.gunService.gun.get('usersTopics').get(userTopic.id).get('encryptedContentKey').put(userTopic.encryptedContentKey);
      await this.gunService.gun.get('usersTopics').get(userTopic.id).get('encryptedBy').put(userId);
    }
    return true;
  }

  public async removeTopic(topicId: string, removeType: 'total' | 'myshare', userId: string, pair: SeaPair): Promise<true> {
    // first read the topic
    // if it doesn't fail it means that the writer user can read it and have access
    const topic = await this.getTopic(userId, topicId, pair);

    if (topic.author !== userId && removeType === 'total') {
      throw new Error('Only author can completely remove a topic');
    }


    if (removeType === 'myshare') {
      return this.removeShare(topicId, userId, pair, userId);
    }

    // total remove
    const userTopics: Array<IUserTopic> = [];
    await this.gunService.gun.get('topics').get(topicId).get('userTopics').once().map().once(async (data) => {
      userTopics.push(data);
    }).then();
    for (const userTopic of userTopics) {
      const thisUserId = await this.gunService.gun.get('usersTopics').get(userTopic.id).get('user').get('id').then() as string;
      await this.removeShare(topicId, userId, pair, thisUserId);
    }
    await this.gunService.gun.get('topics').get(topicId).put(null).then();
    return true;
  }

  public async markTopicAs(topicId: string, status: 'active' | 'answered' | 'archived', userId: string, pair: SeaPair): Promise<true> {
    // first read the topic
    // if it doesn't fail it means that the writer user can read it and have access
    const topic = await this.getTopic(userId, topicId, pair);
    if (topic.author !== userId) {
      throw new Error('Only author can change topic status');
    }
    topic.status = status;
    await this.gunService.gun.get('topics').get(topicId).get('status').put(topic.status).then();
    return true;
  }

}