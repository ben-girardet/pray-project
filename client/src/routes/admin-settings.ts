import { AppNotification } from './../components/app-notification';
import { IRouteableComponent } from '@aurelia/router';
import { Global } from '../global';
import { ICustomElementViewModel, ILogger, IDisposable } from 'aurelia';

export class AdminSettings implements IRouteableComponent, ICustomElementViewModel {

  private events: IDisposable[] = [];
  private logger: ILogger;

  public constructor( 
    @ILogger iLogger: ILogger,
    private global: Global) {
    this.logger = iLogger.scopeTo('stats-route');
  }

  public async binding(): Promise<void> {
    if (!this.global.isRoutingOK()) {
      return;
    }
  }

  public detaching(): void {
    for (const event of this.events) {
      event.dispose();
    }
    this.events = [];
  }

  public async getStats(): Promise<void> {
    try {

    } catch (error) {
      this.logger.error(error);
    }
  }

}
