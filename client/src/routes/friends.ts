import { IFriend, StateService, GunUser } from './../services/internals';
import { IRouteableComponent, IRouter } from '@aurelia/router';
import { IViewModel, inject } from 'aurelia';

@inject()
export class Friends implements IRouteableComponent, IViewModel {

  public friends: IFriend[];
  public requests: IFriend[];
  
  public constructor(@IRouter private router: IRouter, private gunUser: GunUser, private stateService: StateService) {
    
  }

  public async enter(): Promise<void> {
    this.friends = await this.gunUser.getFriends(this.stateService.userId);
    this.requests = await this.gunUser.getFriendRequests(this.stateService.userId);
  }

}