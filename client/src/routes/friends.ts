import { AppNotification } from './../components/app-notification';
import { IRouteableComponent } from '@aurelia/router';
import { ICustomElementViewModel, inject } from 'aurelia';
import { User } from 'shared/types/user';
import { Friendship } from 'shared/types/friendship';
import { apolloAuth, client } from '../apollo';
import { gql } from 'apollo-boost';
import { removeFriendship, respondToFriendshipRequest } from '../commands/friendship';
export interface Friend extends Partial<User> {
  friendshipStatus?: 'accepted' | 'requested';
}

export interface ExtendedFriendship extends Friendship {
  friend?: {
    id?: string;
    firstname?: string;
    lastname?: string;
    picture?: {fileId?: string, width?: number, height?: number}[]
  }
}
@inject()
export class Friends implements IRouteableComponent, ICustomElementViewModel {

  public friends: ExtendedFriendship[];
  public requests: ExtendedFriendship[];
  
  public constructor() {
    
  }

  public async load(): Promise<void> {
    this.getAndSetFriendships();
  }

  public async getAndSetFriendships() {
    const friendships = await this.getFriendships();
    this.friends = friendships.filter(f => f.status === 'accepted');
    this.requests = friendships.filter(f => f.status === 'requested');
  }

  private async getFriendships(): Promise<ExtendedFriendship[]> {
    try {
      const result = await client.query<{friendships: ExtendedFriendship[]}>({query: gql`query {
        friendships {
          id, status, requestedBy {id}, friend {
            id, firstname, lastname, picture {
              fileId, width, height
            }
          }
        }
      }`, fetchPolicy: 'no-cache'});
      return result.data.friendships;
    } catch (error) {
      AppNotification.notify(error.message, 'error');
    }
  }

  public async removeFriendship(friendshipId: string): Promise<void> {
    try {
      await removeFriendship(friendshipId);
      this.requests = this.requests.filter(f => f.id !== friendshipId);
      this.friends = this.friends.filter(f => f.id !== friendshipId);
    } catch (error) {
      AppNotification.notify(error.message, 'error');
    }
  }

  public async respondToFriendshipRequest(friendshipId: string, response: 'accepted' | 'declined'): Promise<void> {
    try {
      await respondToFriendshipRequest(friendshipId, response);
      await this.getAndSetFriendships();
    } catch (error) {
      AppNotification.notify(error.message, 'error');
    }
  }

  public isMyRequest(friendship: Friendship) {
    return friendship.requestedBy.id === apolloAuth.getUserId();
  }

}
