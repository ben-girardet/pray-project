import { GunTopic, ITopic, StateService } from './../services/internals';
import { IRouteableComponent, IRouter } from '@aurelia/router';
import { IViewModel, inject } from 'aurelia';

@inject()
export class Sharing implements IRouteableComponent, IViewModel {

  public static parameters = ['topicId'];

  public topicId: string;
  public topic: ITopic;
  
  public constructor(@IRouter private router: IRouter, private gunTopic: GunTopic, private stateService: StateService) {
    
  }

  public async enter(parameters: {topicId?: string}): Promise<void> {
    if (parameters.topicId) {
      const topic = await this.gunTopic.getTopic(this.stateService.userId, parameters.topicId, this.stateService.pair);
      this.topicId = topic.id;
      this.topic = topic;
    }
  }

}