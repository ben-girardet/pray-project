import { AuthService } from './../services/auth-service';
import { StateService } from './../services/state-service';
import { IRouteableComponent } from '@aurelia/router';
import { IViewModel, IRouter, ILogger } from 'aurelia';
import { AppNotification } from '../components/app-notification';

export class Login implements IRouteableComponent, IViewModel {

  public username = '';
  public password = '';

  private logger: ILogger;

  public constructor(@IRouter private router: IRouter, @ILogger iLogger: ILogger, private stateService: StateService, private authService: AuthService) {
    this.logger = iLogger.scopeTo('login route');
  }

  public async beforeBind(): Promise<void> {
    if (this.stateService.authenticated) {
      this.router.goto('topics');
    }
  }

  public async login(): Promise<void> {
    if (!this.username || !this.password) {
      AppNotification.notify('Please fill in your username and password first', 'info');
    }
    const login = await this.authService.login(this.username, this.password);
    if (!login) {
      AppNotification.notify('Authentication failed', 'error');
    }
  }

}