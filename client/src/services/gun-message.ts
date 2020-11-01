import { GunService, CryptingService, SeaPair, ITopicMessage, IMessage, GunTopic } from './internals';
import { inject } from 'aurelia';
import { customAlphabet }  from 'nanoid';

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 24)

@inject()
export class GunMessage {

  public static cryptedProperties = ['message'];

  public constructor(private gunService: GunService, private gunTopic: GunTopic) {

  }

  public async getTopicMessages(topicId: string, userId: string, pair: SeaPair): Promise<IMessage[]> {
    console.log('getTopicMessages');
    const test = await this.gunService.gun.get('topics').get(topicId).get('topicMessages').then();
    if (!test) {
      return [];
    }

    const topicChainRef = this.gunService.gun.get('topics').get(topicId);
    const userTopic = await topicChainRef.get('userTopics').get(userId).then();
    if (!userTopic) {
      throw new Error('Access denied');
    }
    const encryptedContentKey = userTopic.encryptedContentKey;
    const encryptedBy = userTopic.encryptedBy;
    const writerPub = await this.gunService.gun.get('users').get(encryptedBy).once().get('pubKey').then();
    const decryptedContentKey = await this.gunService.decryptWithPair(encryptedContentKey, pair, writerPub);
    
    const messages: IMessage[] = [];
    
    await this.gunService.gun.get('topics').get(topicId).get('topicMessages').once().map().get('message').once((data) => {
      messages.push(Object.assign({}, data));
    }).then();

    for (const message of messages) {
      CryptingService.decryptObject(message, GunMessage.cryptedProperties, decryptedContentKey);
    }

    return messages;
  }

  public async getMessage(userId: string, messageId: string, pair: SeaPair): Promise<IMessage> {
    console.log('getMessage');
    const messageChainRef = this.gunService.gun.get('messages').get(messageId);
    const message = Object.assign({}, await messageChainRef.then());
    const userTopic = await messageChainRef.get('topic').get('userTopics').get(userId).then();
    if (!userTopic) {
      throw new Error('Access denied');
    }
    const encryptedContentKey = userTopic.encryptedContentKey;
    const encryptedBy = userTopic.encryptedBy;
    const writerPub = await this.gunService.gun.get('users').get(encryptedBy).once().get('pubKey').then();
    const decryptedContentKey = await this.gunService.decryptWithPair(encryptedContentKey, pair, writerPub);
    CryptingService.decryptObject(message, GunMessage.cryptedProperties, decryptedContentKey);
    return message;
  }

  public async createMessage(userId: string, topicId: string, message: IMessage, pair: SeaPair): Promise<IMessage> {
    console.log('createMessage', userId, topicId, message);
    if (!message.id) {
      message.id = nanoid();
    }
    message.author = userId;
    const user = await this.gunService.gun.get('users').get(userId).then();
    if (!user) {
      throw new Error('User not found');
    }
    const topic = await this.gunService.gun.get('topics').get(topicId).then();
    if (!topic) {
      throw new Error('Topic not found');
    }

    const userTopic = await this.gunService.gun.get('topics').get(topicId).get('userTopics').get(userId).then();
    const pub = await this.gunService.gun.get('users').get(userTopic.encryptedBy).once().get('pubKey').then();
    const decryptedContentKey = await this.gunService.decryptWithPair(userTopic.encryptedContentKey, pair, pub);
    this.gunService.changeIdentity(message, userId);
    CryptingService.encryptObject(message, GunMessage.cryptedProperties, decryptedContentKey);
    const createdMessage = await this.gunService.gun.get('messages').get(message.id).put(message).then();
    // link to user
    const topicMessage: ITopicMessage = {
      id: nanoid(),
      topic: topic,
      message: createdMessage
    };
    const relation = await this.gunService.gun.get('topicsMessages').get(topicMessage.id).put(topicMessage).then();
    await this.gunService.gun.get('topics').get(topic.id).get('topicMessages').get(createdMessage.id).put(relation);
    await this.gunService.gun.get('messages').get(createdMessage.id).get('topic').put(topic);
    return createdMessage;
  }
}