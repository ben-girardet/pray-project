import { GunTopic, ITopic, StateService } from './../services/internals';
import { IRouteableComponent, IRouter } from '@aurelia/router';
import { IViewModel, ILogger, EventAggregator, IDisposable } from 'aurelia';

export class TopicDetail implements IRouteableComponent, IViewModel {

  public static parameters = ['topicId'];

  public topicId: string;
  public topic: ITopic;

  private logger: ILogger;
  private event: IDisposable;

  public constructor(@ILogger iLogger: ILogger, private gunTopic: GunTopic, private stateService: StateService, private eventAggregator: EventAggregator, @IRouter private router: IRouter) {
    this.logger = iLogger.scopeTo('topic-detail-route');
  }

  public enter(parameters: {topicId: string}): void {
    this.topicId = parameters.topicId;    
  }

  public async beforeBind(): Promise<void> {
    await this.getTopic();
    this.event = this.eventAggregator.subscribe('topic-form-out', async () => {
      await this.getTopic();
    });
  }

  public afterDetach(): void {
    if (this.event) {
      this.event.dispose();
    }
    delete this.event;
  }

  public async getTopic(): Promise<void> {
    try {
      this.topic = await this.gunTopic.getTopic(this.stateService.userId, this.topicId, this.stateService.pair);
    } catch (error) {
      this.logger.error(error);
    }
  }

  public async removeTopic(): Promise<void> {
    try {
      await this.gunTopic.removeTopic(this.topicId, 'total', this.stateService.userId,  this.stateService.pair);
      this.router.goto('../-@detail');
    } catch (error) {
      this.logger.error(error);
    }
  }

  public async markTopicAs(status: 'active' | 'answered' | 'archived'): Promise<void> {
    try {
      await this.gunTopic.markTopicAs(this.topicId, status, this.stateService.userId,  this.stateService.pair);
      await this.getTopic();
    } catch (error) {
      this.logger.error(error);
    }
  }

}