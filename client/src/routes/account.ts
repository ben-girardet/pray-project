import { AuthService, GunUser, StateService, IUser } from './../services/internals';
import { IRouteableComponent } from '@aurelia/router';
import { IViewModel } from 'aurelia';

export class Account implements IRouteableComponent, IViewModel {

  public user: IUser;

  public constructor(private authService: AuthService, private gunUser: GunUser, private stateService: StateService) {
    
  }

  public async beforeAttach(): Promise<void> {
    this.user = await this.gunUser.getUser(this.stateService.userId);
  }

  public logout(): void {
    this.authService.logout();
  }
}