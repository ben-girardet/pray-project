import { IRouteableComponent } from '@aurelia/router';
import { IViewModel, IRouter, ILogger } from 'aurelia';

export class Test implements IRouteableComponent, IViewModel {

  private logger: ILogger;

  public constructor(@IRouter private router: IRouter, @ILogger iLogger: ILogger) {
    this.logger = iLogger.scopeTo('test route');
  }

}