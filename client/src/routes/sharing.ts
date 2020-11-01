import { IRouteableComponent, IRouter } from '@aurelia/router';
import { IViewModel, inject } from 'aurelia';
import { Topic } from 'shared/types/topic'

@inject()
export class Sharing implements IRouteableComponent, IViewModel {

  public static parameters = ['topicId'];

  public topicId: string;
  public topic: Topic;
  
  public constructor(@IRouter private router: IRouter) {
    
  }

  public async enter(parameters: {topicId?: string}): Promise<void> {
    if (parameters.topicId) {
      // const topic = await this.gunTopic.getTopic();
      // this.topicId = topic.id;
      // this.topic = topic;
    }
  }

}