import { apolloAuth, client } from './../apollo';
import { IRouteableComponent } from '@aurelia/router';
import { ICustomElementViewModel, IRouter, ILogger } from 'aurelia';
import { AppNotification } from '../components/app-notification';
import { login } from '../commands/login';
import PhoneNumber from 'awesome-phonenumber';
import { Global } from '../global';

export class Login implements IRouteableComponent, ICustomElementViewModel {

  public username = '';
  public password = '';
  public countryCode = 'CH';

  private logger: ILogger;
  // private apolloAuth = apolloAuth;

  public constructor(
    @IRouter private router: IRouter, 
    @ILogger iLogger: ILogger,
    private global: Global) {
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
      const username = this.parseUsername();
      login(username, this.password).then((loginResult) => {
        if (apolloAuth.isTokenValid()) {
          window.localStorage.setItem('sun_un', this.username);
          const state = apolloAuth.getState();
          if (state === 1) {
            // active
            this.router.load('topics');
          } else if (state === 0) {
            // need to complete identity
            this.router.load('register(identity)');
          }
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

  // TODO: this method is identical with parseUsername()
  // from register.ts => should be merged
  public parseUsername(): string {
    const isEmail = this.username.indexOf('@') !== -1;
    if (isEmail) {
      const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if(!re.test(this.username)) {
        throw new Error('Please enter a valid email address or mobile number');
      }
      return this.username;
    } else {
      const phoneNumber = new PhoneNumber( this.username, this.countryCode.toLowerCase() );
      if (!phoneNumber.isValid()) {
        throw new Error('Please enter a valid email address or mobile number');
      }
      return phoneNumber.getNumber();
    }
  }

}
