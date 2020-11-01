import { IFriend, IUser, StateService, GunUser } from './../services/internals';
import { IRouteableComponent, IRouter } from '@aurelia/router';
import { IViewModel, inject } from 'aurelia';

@inject()
export class AddFriend implements IRouteableComponent, IViewModel {

  public friends: IFriend[];
  public requests: IFriend[];

  public emailOrMobile: string;
  public found: IUser | null;
  
  public constructor(@IRouter private router: IRouter, private gunUser: GunUser, private stateService: StateService) {
    
  }

  public async enter(): Promise<void> {
    this.friends = await this.gunUser.getFriends(this.stateService.userId);
    this.requests = await this.gunUser.getFriendRequests(this.stateService.userId);
  }

  public async search(): Promise<void> {
    this.found = await this.gunUser.searchUser(this.emailOrMobile);
  }

}