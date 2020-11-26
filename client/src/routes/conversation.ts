import { CryptingService } from './../services/crypting-service';
import { Topic } from 'shared/types/topic';
import { Message } from 'shared/types/message';
import { IRouteableComponent, IRouter } from '@aurelia/router';
import { IViewModel, ILogger, EventAggregator, IDisposable } from 'aurelia';
import { getTopic } from '../commands/topic';

export class Conversation implements IRouteableComponent, IViewModel {

  // public static parameters = ['topicId', 'userId'];

  public userId: string;
  public topicId: string;
  public topic: Topic & {messages?: Partial<Message>[]};

  private logger: ILogger;
  private event: IDisposable;

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
      console.log('topic', topic);
      this.topic = topic;
    } catch (error) {
      this.logger.error(error);
    }
  }

  

}