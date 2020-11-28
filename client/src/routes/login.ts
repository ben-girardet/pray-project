import { apolloAuth, client } from './../apollo';
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
      this.router.load('topics');
    } else {
      client.clearStore();
    }
  }

  public login(): false {
    if (!this.username || !this.password) {
      AppNotification.notify('Please fill in your username and password first', 'info');
      return false;
    }
    try {
      login(this.username, this.password).then((loginResult) => {
        if (apolloAuth.isTokenValid()) {
          this.router.load('topics');
        }
        if (!loginResult) {
          AppNotification.notify('Authentication failed', 'error');
        }
      });
    } catch (error) {
      AppNotification.notify(error.message, 'error');
    }
    return false;
  }

}