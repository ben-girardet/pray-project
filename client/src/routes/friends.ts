// TODO: fix missing model/interfaces/commands here
import { IRouteableComponent, IRouter } from '@aurelia/router';
import { IViewModel, inject } from 'aurelia';

@inject()
export class Friends implements IRouteableComponent, IViewModel {

  // public friends: IFriend[];
  // public requests: IFriend[];
  
  public constructor(@IRouter private router: IRouter) {
    
  }

  public async enter(): Promise<void> {
    // this.friends = await this.gunUser.getFriends();
    // this.requests = await this.gunUser.getFriendRequests();
  }

}