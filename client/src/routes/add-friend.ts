// TODO: fix missing interfaces and esrvice
import { IRouteableComponent, IRouter } from '@aurelia/router';
import { IViewModel, inject } from 'aurelia';

@inject()
export class AddFriend implements IRouteableComponent, IViewModel {

  // public friends: IFriend[];
  // public requests: IFriend[];

  public emailOrMobile: string;
  // public found: IUser | null;
  
  // public constructor(@IRouter private router: IRouter) {
    
  // }

  // public async enter(): Promise<void> {
  //   this.friends = 
  //   this.requests =
  // }

  // public async search(): Promise<void> {
  //   this.found = await this.gunUser.searchUser(this.emailOrMobile);
  // }

}