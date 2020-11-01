import { Topic as ITopic } from 'shared/types/topic';
import { IRouteableComponent } from '@aurelia/router';
import { IViewModel } from 'aurelia';

export class Topic implements IRouteableComponent, IViewModel {

  private topic?: ITopic;
  private static parameters: Array<string> = ['id'];

  public constructor() {

  }

  public async canEnter(parameters: {id: string}): Promise<boolean> {
    // TODO: fix getTopic this.topic = await this.gunTopic.getTopic();
    // if (this.topic === undefined) {
    //   throw new Error('Topic not found');
    // }
    return this.topic !== undefined;
  }

}