import { EventAggregator, ILogger, IRouter, IPlatform } from 'aurelia';
export class Global {

  private firstRouteIgnored:  -1 | 0 | 1 = -1;
  private logger: ILogger;

  public constructor(
    public eventAggregator: EventAggregator, 
    @ILogger iLogger: ILogger,
    @IRouter public router: IRouter,
    @IPlatform public platform: IPlatform) {
    this.logger = iLogger.scopeTo('global');
  }

  public isRoutingOK() {
    return this.firstRouteIgnored === 1;
  }

  public bumpRoute() {
    if (this.firstRouteIgnored === -1) {
      this.firstRouteIgnored = 0;
    } else if (this.firstRouteIgnored === 0) {
      this.firstRouteIgnored = 1;
    }
  }
}
