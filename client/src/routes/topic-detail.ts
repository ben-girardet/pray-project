import { CryptingService } from './../services/crypting-service';
import { Topic } from 'shared/types/topic';
import { IRouteableComponent } from '@aurelia/router';
import { ICustomElementViewModel, ILogger, EventAggregator, IDisposable, IRouter } from 'aurelia';
import { editTopic, getTopic, removeTopic } from '../commands/topic';
import { Global } from '../global';

export class TopicDetail implements IRouteableComponent, ICustomElementViewModel {

  public static parameters = ['topicId'];

  public topicId: string;
  public topic: Topic;

  private logger: ILogger;
  private events: IDisposable[] = [];

  public constructor(
    @ILogger iLogger: ILogger, 
    private global: Global) {
    this.logger = iLogger.scopeTo('topic-detail-route');
  }

  public load(parameters: {topicId: string}): void {
    this.topicId = parameters.topicId;
  }

  public async binding(): Promise<void> {
    if (!this.global.isRoutingOK()) {
      return;
    }
    await this.getTopic();
    this.events.push(this.global.eventAggregator.subscribe('topic-form-out', async () => {
      await this.tryToFetchTopic();
    }));
    this.events.push(this.global.eventAggregator.subscribe('sharing-out', async () => {
       await this.tryToFetchTopic();
    }));
    this.events.push(this.global.eventAggregator.subscribe('page:foreground:auth', async () => {
      await this.tryToFetchTopic();
   }));
  }

  public detached(): void {
    for (const event of this.events) {
      event.dispose();
    }
    this.events = [];
  }

  public async getTopic(): Promise<void> {
    try {
      const topic = await getTopic(this.topicId)
      await CryptingService.decryptTopic(topic);
      this.topic = topic;
    } catch (error) {
      this.logger.error(error);
    }
  }

  public async tryToFetchTopic(): Promise<void> {
    try {
      const topic = await getTopic(this.topicId, {withMessages: false}, 'network-only');
      await CryptingService.decryptTopic(topic);
      this.topic = topic;
    } catch (error) {
      // if error, do nothing
    }
  }

  public async removeTopic(): Promise<void> {
    try {
      await removeTopic(this.topicId);
      this.global.router.load('../-@detail');
    } catch (error) {
      this.logger.error(error);
    }
  }

  public async markTopicAs(status: 'active' | 'answered' | 'archived'): Promise<void> {
    try {
      await editTopic(this.topicId, {status});
      await this.tryToFetchTopic();
    } catch (error) {
      this.logger.error(error);
    }
  }

}
