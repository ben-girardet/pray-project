import { apolloAuth } from './../apollo';
import { IRouteableComponent } from '@aurelia/router';
import { IViewModel } from 'aurelia';
import { User as IUser } from 'shared/types/user';

export class Account implements IRouteableComponent, IViewModel {

  // TODO: fix user interface here
  public user: IUser;

  public constructor() {
    
  }

  public async beforeAttach(): Promise<void> {
    // TODO: fix get current uesr here
  }

  public logout(): void {
    apolloAuth.logout();
  }
}