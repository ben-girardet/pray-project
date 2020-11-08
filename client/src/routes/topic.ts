import { Topic as ITopic } from 'shared/types/topic';
import { IRouteableComponent } from '@aurelia/router';
import { IViewModel } from 'aurelia';
import { getTopic } from '../commands/topic';

export class Topic implements IRouteableComponent, IViewModel {

  private topic?: ITopic;
  private static parameters: Array<string> = ['id'];

  public constructor() {

  }

  public async canEnter(parameters: {id: string}): Promise<boolean> {
    this.topic = await getTopic(parameters.id);
    if (this.topic === undefined) {
      throw new Error('Topic not found');
    }
    return this.topic !== undefined;
  }

}