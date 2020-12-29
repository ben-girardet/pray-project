import { gql } from 'apollo-boost';
import { client } from '../apollo';
import { inject, EventAggregator, IDisposable } from 'aurelia';
import { UnviewedTopic } from 'shared/types/unviewed-topic';

const unviewedQuery = gql`
query Unviewed {
  unviewed {
    id,
    isViewed,
    messages,
    prayers
  }
}`;

@inject(EventAggregator)
export class NotificationService {

  public unviewedTopicIds: string[] = [];
  public unviewedMessages: {[key: string]: string[]} = {};
  public unviewedPrayers: {[key: string]: string[]} = {};
  public unviewedNumbers: {[key: string]: number} = {};
  public subscriptions: IDisposable[] = [];

  public constructor(private eventAggregator: EventAggregator) {
    this.subscriptions.push(this.eventAggregator.subscribe('page:foreground:auth', () => {
      this.fetchUnviewedStatus();
    }));
    this.subscriptions.push(this.eventAggregator.subscribe('login', () => {
      this.fetchUnviewedStatus();
    }));
    this.subscriptions.push(this.eventAggregator.subscribe('app:started', () => {
      this.fetchUnviewedStatus();
    }));
    this.subscriptions.push(this.eventAggregator.subscribe('logout', () => {
      this.reset();
    })); 
  }

  public async fetchUnviewedStatus(): Promise<void> {
    try {
      const result = await client.query<{unviewed: UnviewedTopic[]}>({query: unviewedQuery, fetchPolicy: 'network-only'});
      this.unviewedTopicIds = result.data.unviewed.filter(u => !u.isViewed).map(u => u.id);
      const unviewedMessages: {[key: string]: string[]} = {};
      const unviewedPrayers: {[key: string]: string[]} = {};
      const unviewedNumbers: {[key: string]: number} = {};
      for (const unviewedTopic of result.data.unviewed) {
        let unviewedNumber = 0;
        if (unviewedTopic.messages && unviewedTopic.messages.length > 0) {
          unviewedMessages[unviewedTopic.id] = unviewedTopic.messages;
          unviewedNumber += unviewedTopic.messages.length;
        }
        if (unviewedTopic.prayers && unviewedTopic.prayers.length > 0) {
          unviewedPrayers[unviewedTopic.id] = unviewedTopic.prayers;
          unviewedNumber += unviewedTopic.prayers.length;
        }
        unviewedNumbers[unviewedTopic.id] = unviewedNumber;
      }

      this.unviewedMessages = unviewedMessages;
      this.unviewedPrayers = unviewedPrayers;
      this.unviewedNumbers = unviewedNumbers;
      this.eventAggregator.publish('unviewed:update');
    } catch (error) {
      // do nothing
    }
  }

  private reset() {
    this.unviewedTopicIds = [];
    this.unviewedMessages = {};
    this.unviewedPrayers = {};
  }

}
