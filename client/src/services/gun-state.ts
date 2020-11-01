export interface ByGunKey<T> {
  [gunIdPath: string]: T;
}

export interface IModel {
  id?: string;
  author?: string;
  creationDate?: string;
  lastUpdateAuthor?: string;
  lastUpdateDate?: string;
}

export interface IRelation {
  id: string;
}

export interface IUserRelation extends IRelation {
  user: any;
  encryptedContentKey: string;
  encryptedBy: string; // UserId
}

export interface IUserTopic extends IUserRelation {
  topic: any;
}

export interface ITopicMessage extends IRelation {
  message: IMessage;
  topic: ITopic;
}

export interface IFollow extends IUserRelation {
  friend: any;
}

export interface IFriend extends IModel {
  user1: any;
  user2: any;
  requestedBy: string;
  status: 'requested' | 'accepted';
}

export interface IUser extends IModel {
  firstname: string;
  lastname: string;
  profilePicSmallB64: string;
  profilePicSmall: string;
  profilePicMedium: string;
  profilePicLarge: string;
  pubKey: string;
  userTopics?: ByGunKey<IUserTopic>;
  following?: ByGunKey<IFollow>;
  followers?: ByGunKey<IFollow>;
  friends?: ByGunKey<IFriend>;
}

export interface ITopic extends IModel {
  title: string;
  description: string;
  color: string;
  imageSmallB64?: string;
  imageSmall?: string;
  imageMedium?: string;
  imageLarge?: string;
  status: 'active' | 'answered' | 'archived';
  userTopics?: ByGunKey<IUserTopic>;  // key is UserId
  topicMessages?: ByGunKey<ITopicMessage>; // key is MessageId
}

export interface IMessage extends IModel {
  message: string;
  topic?: ITopic;
}

export type MainRefs = 'users' | 'topics' | 'messages';
export type RelRefs = 'usersTopics' | 'usersMessages' | 'topicsMessages' | 'follows';

export interface GunState {
  users: ByGunKey<IUser>;
  topics: ByGunKey<ITopic>;
  messages: ByGunKey<IMessage>;
  usersTopics: ByGunKey<IUserTopic>; // key is UserTopicId
  topicsMessages: ByGunKey<ITopicMessage>; // key is TopicMessageId
  follows: ByGunKey<IFollow>;
  friendships: ByGunKey<IFriend>;
}

export interface SeaPair {
  priv: string;
  pub: string;
  epriv: string;
  epub: string;
}