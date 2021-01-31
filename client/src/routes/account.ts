import { AppNotification } from './../components/app-notification';
import { apolloAuth, client } from './../apollo';
import { gql } from 'apollo-boost';
import { IRouteableComponent } from '@aurelia/router';
import { ICustomElementViewModel, IDisposable, EventAggregator, IRouter } from 'aurelia';
import { User as IUser } from 'shared/types/user';
import { logout } from '../commands/login';
import { Global } from '../global';

export class Account implements IRouteableComponent, ICustomElementViewModel {

  public user: IUser;
  private events: IDisposable[] = [];
  public language: string;

  public constructor(
    @IRouter private router: IRouter, 
    private eventAggregator: EventAggregator,
    private global: Global) {
    
  }

  public async binding(): Promise<void> {
    if (!this.global.isRoutingOK()) {
      return;
    }
    this.user = await this.getUser();
    this.events.push(this.eventAggregator.subscribe('edit-profile-out', async () => {
      this.user = await this.getUser();
    }));
  }

  public attached() {
    this.language = this.global.i18n.getLocale();
  }

  public detached(): void {
    for (const event of this.events) {
      event.dispose();
    }
    this.events = [];
  }

  public async getUser(): Promise<{id: string, firstname: string, lastname: string, email: string, mobile: string, picture:{fileId: string, width: number, height: number}[]}> {
    if (!apolloAuth.getUserId()) {
      return null
    }
    const result = await client.query<{user: {
      id: string,
      firstname: string, 
      lastname: string, 
      email: string,
      mobile: string,
      picture: {fileId: string, width: number, height: number}[]}}>({query: gql`query User($userId: String!) {
user(id: $userId) {
  id,
  firstname,
  lastname,
  email,
  mobile,
  picture {
    fileId,
    width,
    height
  },
  nbFriends
}
    }`, variables: {userId: apolloAuth.getUserId()}, fetchPolicy: 'network-only'});
    return result.data.user;
  }

  public async logout(): Promise<void> {
    try {
      await logout();
      apolloAuth.logout();
      this.global.eventAggregator.publish('logout');
      this.router.load('start');
    } catch (error) {
      AppNotification.notify(error.message, 'error');
    }
  }

  public editProfile() {
    
  }

  public updateLanguage() {
    this.global.i18n.setLocale(this.language);
    this.global.eventAggregator.publish('app:locale:changed');
  }
}
