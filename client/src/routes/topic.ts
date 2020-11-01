import { GunTopic, ITopic, StateService } from './../services/internals';
import { IRouteableComponent } from '@aurelia/router';
import { IViewModel } from 'aurelia';

export class Topic implements IRouteableComponent, IViewModel {

  private topic?: ITopic;
  private static parameters: Array<string> = ['id'];

  public constructor(private gunTopic: GunTopic, private stateService: StateService) {

  }

  public async canEnter(parameters: {id: string}): Promise<boolean> {
    this.topic = await this.gunTopic.getTopic(this.stateService.userId, parameters.id, this.stateService.pair);
    // if (this.topic === undefined) {
    //   throw new Error('Topic not found');
    // }
    return this.topic !== undefined;
  }

}