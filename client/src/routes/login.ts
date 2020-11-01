import { apolloAuth } from './../apollo';
import { IRouteableComponent } from '@aurelia/router';
import { IViewModel, IRouter, ILogger } from 'aurelia';
import { AppNotification } from '../components/app-notification';
import { login } from '../commands/login';

export class Login implements IRouteableComponent, IViewModel {

  public username = '';
  public password = '';

  private logger: ILogger;
  // private apolloAuth = apolloAuth;

  public constructor(@IRouter private router: IRouter, @ILogger iLogger: ILogger) {
    this.logger = iLogger.scopeTo('login route');
  }

  public async beforeBind(): Promise<void> {
    if (apolloAuth.authenticated) {
      this.router.goto('topics');
    }
  }

  public async login(): Promise<void> {
    if (!this.username || !this.password) {
      AppNotification.notify('Please fill in your username and password first', 'info');
    }
    const loginResult = await login(this.username, this.password);
    if (!loginResult) {
      AppNotification.notify('Authentication failed', 'error');
    }
  }

}