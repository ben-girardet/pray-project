import { AppNotification } from './../components/app-notification';
import { CryptingService } from './../services/crypting-service';
import { Topic } from 'shared/types/topic';
import { Message } from 'shared/types/message';
import { Prayer } from 'shared/types/prayer';
import { IRouteableComponent, IRouter } from '@aurelia/router';
import { IViewModel, ILogger, EventAggregator, IDisposable } from 'aurelia';
import { getTopic } from '../commands/topic';
import { createMessageInTopic } from '../commands/message';
import moment from 'moment';
import { apolloAuth } from '../apollo';

interface GroupPrayers {
  prayers: Array<{userId: string; date: Date}>;
}
interface GroupIdentity {
  userId: string;
  who: 'me' | 'them';
  messages: {text: string; date: Date}[];
}
interface GroupDay {
  date: Date;
  groups: (GroupIdentity | GroupPrayers)[];
}

export class Conversation implements IRouteableComponent, IViewModel {

  // public static parameters = ['topicId', 'userId'];

  public userId: string;
  public topicId: string;
  public topic: Topic & {messages?: Partial<Message>[]; prayers?: Partial<Prayer>[]};

  private logger: ILogger;
  private event: IDisposable;

  private conversationHead: HTMLDivElement;
  private conversationContent: HTMLDivElement;
  private conversationBottom: HTMLDivElement;
  private textarea: HTMLTextAreaElement;
  public message: string = '';

  public dayGroups: GroupDay[] = [];

  public constructor(@ILogger iLogger: ILogger, private eventAggregator: EventAggregator, @IRouter private router: IRouter) {
    this.logger = iLogger.scopeTo('conversation-route');
  }

  // TODO: in the future a conversation can happen either inside a topic or between two people
  public load(parameters: {topicId?: string, userId?: string}): void {
    if (parameters.topicId && parameters.userId) {
      throw new Error('Invalid conversation load, must only have topicId OR userId, not both');
    } else if (parameters.topicId) {
      this.topicId = parameters.topicId;
    } else if (parameters.userId) {
      this.userId = parameters.userId;
    } else {
      throw new Error('Invalid conversation load, must only have topicId OR userId, not both');
    }
  }

  public async binding(): Promise<void> {
    if (this.topicId) {
      await this.getTopic();
    } else if (this.userId) {
      // TODO: handle this scenario later
    }
  }

  public attached() {
    this.setHeights();
  }

  public detached(): void {
    if (this.event) {
      this.event.dispose();
    }
    delete this.event;
  }

  public async getTopic(): Promise<void> {
    try {
      const topic = await getTopic(this.topicId, {withMessages: true});
      await CryptingService.decryptTopic(topic);
      // this.topic = JSON.parse(JSON.stringify(topic));
      this.topic = topic;
      this.prepareMessagesAndPrayersInGroups();
    } catch (error) {
      this.logger.error(error);
      AppNotification.notify(error.message, 'error');
    }
  }

  public messageChanged() {
    this.fitTextContent();
  }

  public fitTextContent() {
    if (this.textarea instanceof HTMLTextAreaElement) {
      let currentHeight = this.textarea.offsetHeight;
      if (this.message) {
        this.textarea.style.height = 'auto';
        // TODO: fix this 94 value
        let h = Math.min(94, this.textarea.scrollHeight + 2);
        this.textarea.style.height = `${h}px`;
        // TODO: fix the following line to adjust the scroll of the content above
        // let newHeight = this.textarea.offsetHeight;
        // let diff = newHeight - currentHeight;
        // if (diff > 0) {
        //   this.contentElement.scrollTop += diff;
        // } 
      } else {
        this.textarea.style.height = '';
      }
      this.setHeights();
    }
  }

  private setHeights() {
    this.conversationContent.style.height = `calc(100vh - ${this.conversationHead.offsetHeight}px - ${this.conversationBottom.offsetHeight}px)`;
  }

  public async sendMessage(): Promise<void> {
    try {
      await createMessageInTopic(this.topicId, this.message);
      this.message = '';
      // TODO: optimize this thing when a conversation has lots of messages
      await this.getTopic();
    } catch (error) {
      AppNotification.notify(error.message, 'error');
    }
  }

  public prepareMessagesAndPrayersInGroups() {
    const dayGroups: GroupDay[] = [];
    let currentDay = '';
    let currentDayGroup: GroupDay;
    let currentIdentityGroup: GroupIdentity;
    let currentPrayersGroup: GroupPrayers;
    let currentUserId: '';

    const messagesAndPrayers: Array<(Partial<Message> | Partial<Prayer>) & {type: 'message' | 'prayer'}  > = []
      .concat(...this.topic.messages.map((message) => {
        return {...message, ...{type: 'message'}};
      }))
      .concat(...this.topic.prayers.map((message) => {
        return {...message, ...{type: 'prayer'}};
      }))
      .sort((a, b) => {
        const ma = moment(a.createdAt);
        const mb = moment(b.createdAt);
        if (ma.isBefore(mb)) {
          return -1
        } else if (mb.isBefore(ma)) {
          return 1;
        } else {
          return 0;
        }
      });

    for(const item of messagesAndPrayers) {
      const itemMoment = moment(item.createdAt);
      const itemDay = itemMoment.format('DD/MM/YYYY');
      if (itemDay !== currentDay) {
        currentDay = itemDay;
        currentDayGroup = {
          date: itemMoment.toDate(),
          groups: []
        };
        currentUserId = '';
        currentPrayersGroup = undefined;
        dayGroups.push(currentDayGroup);
      }

      if (item.type === 'message') {
        currentPrayersGroup = undefined;
        const message: Partial<Message> = item;
        if (message.createdBy.id !== currentUserId) {
          currentUserId = message.createdBy.id;
          currentIdentityGroup = {
            who: message.createdBy.id === apolloAuth.getUserId() ? 'me' : 'them',
            userId: message.createdBy.id,
            messages: []
          };
          currentDayGroup.groups.push(currentIdentityGroup);
        }
        currentIdentityGroup.messages.push({date: moment(message.createdAt).toDate(), text: message.text});
      } else if (item.type === 'prayer') {
        currentUserId = '';
        const prayer: Partial<Prayer> = item;
        const prayerToAdd = {userId: prayer.createdBy.id, date: moment(prayer.createdAt).toDate()};
        if (!currentPrayersGroup) {
          const group: GroupPrayers = {
            prayers: [prayerToAdd]
          };
          currentPrayersGroup = group;
          currentDayGroup.groups.push(group);
        } else {
          currentPrayersGroup.prayers.push(prayerToAdd);
        }
      }

    }
    this.dayGroups = dayGroups;
    console.log('this.dayGroups', this.dayGroups);
  }

  

}