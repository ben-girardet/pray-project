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

  public attached() {
    // TODO: use the aurelia task thing
    setTimeout(() => {
      const username = window.localStorage.getItem('sun_un');
      if (username) {
        this.username = username;
        const pwd_el = document.querySelector('#login_password');
        if (pwd_el instanceof HTMLElement) {
          pwd_el.focus();
        }
      } else {
        const un_el = document.querySelector('#login_username');
        if (un_el instanceof HTMLElement) {
          un_el.focus();
        }
      }
    }, 100);
  }

  public login(event: Event): false {
    if (event) {
      event.preventDefault();
    }
    if (!this.username || !this.password) {
      AppNotification.notify('Please fill in your username and password first', 'info');
      return false;
    }
    try {
      login(this.username, this.password).then((loginResult) => {
        if (apolloAuth.isTokenValid()) {
          window.localStorage.setItem('sun_un', this.username);
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