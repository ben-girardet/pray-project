import { GunService, IUser, IFriend, ApiService } from './internals';
import { inject } from 'aurelia';
import { nanoid } from 'nanoid';

@inject(GunService)
export class GunUser {

  public constructor(private gunService: GunService, private apiService: ApiService) {
    
  }

  public async createUser(user: IUser): Promise<void> {
    delete user.userTopics;
    delete user.followers;
    delete user.following;
    this.gunService.changeIdentity(user, user.id);
    console.log('createUser', user.id);
    await this.gunService.gun.get('users').get(user.id).put(user).then();
  }

  public async set(userId: string, key: 'firstname' | 'lastname' | 'profilePicSmallB64' | 'profilePicSmall' | 'profilePicMedium' | 'profilePicLarge', value: string): Promise<void> {
    console.log('set user', userId, key);
    await this.gunService.gun.get('users').get(userId).get(key).put(value).then();
  }

  public async getUser(userId: string): Promise<IUser> {
    const data = Object.assign({}, await this.gunService.gun.get('users').get(userId).once().then());
    console.log('getUser', data);
    return data;
  }

  public async searchUser(emailOrMobile: string): Promise<IUser | null> {
    const type = emailOrMobile.indexOf('@') === -1 ? 'mobile' : 'email';
    const exists = await this.apiService.get(`/users/exists/${type}/${emailOrMobile}`);
    if (!exists.exists) {
      return null;
    }
    return this.getUser(exists.id);
  }

  public async requestFriendship(userId: string, friendUserId: string): Promise<void> {
    const existing = await this.gunService.gun.get('users').get(userId).get('friends').get(friendUserId).then();
    if (existing) {
      throw new Error('Frienship already exists');
    }
    // fetch user
    const user = await this.gunService.gun.get('users').get(userId).then();
    if (!user) {
      throw new Error('User not found');
    }
    // fetch friend
    const friend = await this.gunService.gun.get('users').get(friendUserId).then();
    if (!friend) {
      throw new Error('Friend not found');
    }
    const friendship: IFriend = {
      id: nanoid(),
      user1: user,
      user2: friend,
      requestedBy: user.id,
      status: 'requested'
    };
    const relation = await this.gunService.gun.get('friendships').get(friendship.id).put(friendship).then();
    await this.gunService.gun.get('users').get(userId).get('friends').get(friendUserId).put(relation);
    await this.gunService.gun.get('users').get(friendUserId).get('friends').get(userId).put(relation);
  }

  public async acceptFriendship(userId: string, friendUserId: string): Promise<void> {
    const relation = await this.gunService.gun.get('users').get(userId).get('friends').get(friendUserId).then();
    if (!relation) {
      throw new Error('Friend request not found');
    }
    relation.status = 'accepted';
    await this.gunService.gun.get('friendships').get(relation.id).get('status').put('accepted').then();
  }

  public async rejectFriendship(userId: string, friendUserId: string): Promise<void> {
    const relation = await this.gunService.gun.get('users').get(userId).get('friends').get(friendUserId).then();
    if (!relation) {
      throw new Error('Friend request not found');
    }
    await this.gunService.gun.get('friendships').get(relation.id).put(null).then();
    await this.gunService.gun.get('users').get(relation.user1.id).get('friends').get(relation.user2.id).put(null).then();
    await this.gunService.gun.get('users').get(relation.user2.id).get('friends').get(relation.user1.id).put(null).then();
  }

  public async getFriendRequests(userId: string): Promise<IFriend[]> {
    return this.getFriendships(userId, 'accepted');
  }

  public async getFriends(userId: string): Promise<IFriend[]> {
    return this.getFriendships(userId, 'accepted');
  }

  public async getFriendships(userId: string, status: 'accepted' | 'requested' | 'all' = 'all'): Promise<IFriend[]> {
    const friends: IFriend[] = [];
    const test = await this.gunService.gun.get('users').get(userId).get('friends').then();
    if (!test) {
      return [];
    }
    await this.gunService.gun.get('users').get(userId).get('friends').once().map().once((data) => {
      if (!data) {
        return;
      }
      const friend: IFriend = data;
      if (friend.status === status || status === 'all') {
        friends.push(data);
      }
    }).then();
    return friends;
  }

  public async removeFriendship(userId: string, friendId: string): Promise<void> {
    throw new Error('Not implemented yet');
  }

  

}