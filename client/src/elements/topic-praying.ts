import { CryptingService } from './../services/crypting-service';
import { Topic } from 'shared/types/topic';
import { IRouteableComponent, IRouter } from '@aurelia/router';
import { IViewModel, ILogger, EventAggregator, IDisposable, bindable } from 'aurelia';
import { editTopic, getTopic, removeTopic } from '../commands/topic';

export class TopicPraying implements IViewModel {

  public static parameters = ['topicId'];

  @bindable public topicId: string;
  public topic: Topic;

  private logger: ILogger;

  public constructor(@ILogger iLogger: ILogger, private element: HTMLElement) {
    this.logger = iLogger.scopeTo('topic-praying');
  }

  public async binding(): Promise<void> {
    await this.topicIdChanged();
  }
  
  public async topicIdChanged(): Promise<void> {
    await this.getTopic();
  }

  public detached(): void {
    
  }

  public async getTopic(): Promise<void> {
    try {
      const topic = await getTopic(this.topicId);
      await CryptingService.decryptTopic(topic);
      this.topic = topic;
    } catch (error) {
      this.logger.error(error);
    }
  }

  public dispatchEvent(event: string) {
    this.element.dispatchEvent(new CustomEvent(event, {bubbles: true}));
  }

}