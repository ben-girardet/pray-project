import { CryptingService } from './../services/crypting-service';
import { WithShares } from './../../../shared/types/share';
import { AppNotification } from './../components/app-notification';
import { IRouteableComponent, IRouter } from '@aurelia/router';
import { IViewModel, inject } from 'aurelia';
import { Topic } from 'shared/types/topic'
import { getTopic, addShareToTopic, removeShareToTopic } from '../commands/topic';
import { client } from '../apollo';
import { gql } from 'apollo-boost';
import { ExtendedFriendship } from './friends';
import { wait } from '../util';
@inject()
export class Sharing implements IRouteableComponent, IViewModel {

  public static parameters = ['topicId'];

  public topicId: string;
  public topic: Topic & WithShares;
  public friends: ExtendedFriendship[];
  public changingUserId: {[key: string]: boolean} = {};
  
  public constructor(@IRouter private router: IRouter) {
    
  }

  public async load(parameters: {topicId?: string}): Promise<void> {
    if (parameters.topicId) {
      try {
        const topic = await getTopic(parameters.topicId);
        this.topicId = topic.id;
        this.topic = topic;
      } catch (error) {
        AppNotification.notify(error.message, 'error');
      }
    }
    this.getAndSetFriendships();
  }

  public async getAndSetFriendships() {
    this.friends = await this.getFriendships();
  }

  private async getFriendships(): Promise<ExtendedFriendship[]> {
    try {
      const result = await client.query<{friendships: ExtendedFriendship[]}>({query: gql`query {
        friendships(status: "accepted") {
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

  public hasShare(userId: string): boolean {
    const shares = this.topic?.shares || [];
    return shares.find(s => s.userId === userId) !== undefined;
  }

  public async shareChange(event: CustomEvent, userId: string) {
    if (this.changingUserId[userId]) {
      return;
    }
    const element = event.target as any;
    const checked = element.checked;

    try {
      if (!this.hasShare(userId) && checked) {
        // add share
        this.changingUserId[userId] = true;
        const encryptedContentKey = await CryptingService.recryptContentKeyFor(this.topic.myShare, userId);
        const shares = await addShareToTopic(this.topic.id, userId, encryptedContentKey);
        this.topic.shares = shares;
      } else if (this.hasShare(userId) && !checked) {
        // remove share
        this.changingUserId[userId] = true;
        const shares = await removeShareToTopic(this.topic.id, userId);
        this.topic.shares = shares;// this.topic.shares.filter(s => s.userId !== userId):
      }
      await wait(300);
    } catch (error) {
      AppNotification.notify(error.message, 'error');
    } finally {
      this.changingUserId[userId] = false;
    }

  }

}