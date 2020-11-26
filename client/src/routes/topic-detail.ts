import { CryptingService } from './../services/crypting-service';
import { Topic } from 'shared/types/topic';
import { IRouteableComponent, IRouter } from '@aurelia/router';
import { IViewModel, ILogger, EventAggregator, IDisposable } from 'aurelia';
import { editTopic, getTopic, removeTopic } from '../commands/topic';

export class TopicDetail implements IRouteableComponent, IViewModel {

  public static parameters = ['topicId'];

  public topicId: string;
  public topic: Topic;

  private logger: ILogger;
  private event: IDisposable;

  public constructor(@ILogger iLogger: ILogger, private eventAggregator: EventAggregator, @IRouter private router: IRouter) {
    this.logger = iLogger.scopeTo('topic-detail-route');
  }

  public load(parameters: {topicId: string}): void {
    this.topicId = parameters.topicId;
  }

  public async binding(): Promise<void> {
    await this.getTopic();
    this.event = this.eventAggregator.subscribe('topic-form-out', async () => {
      await this.getTopic();
    });
    this.event = this.eventAggregator.subscribe('sharing-out', async () => {
       await this.getTopic();
    });
  }

  public detached(): void {
    if (this.event) {
      this.event.dispose();
    }
    delete this.event;
  }

  public async getTopic(): Promise<void> {
    try {
      const topic = await getTopic(this.topicId);
      await CryptingService.decryptTopic(topic);
      console.log('get topic', topic);
      this.topic = topic;
    } catch (error) {
      this.logger.error(error);
    }
  }

  public async removeTopic(): Promise<void> {
    try {
      await removeTopic(this.topicId);
      this.router.load('../-@detail');
    } catch (error) {
      this.logger.error(error);
    }
  }

  public async markTopicAs(status: 'active' | 'answered' | 'archived'): Promise<void> {
    try {
      await editTopic(this.topicId, {status});
      await this.getTopic();
    } catch (error) {
      this.logger.error(error);
    }
  }

}