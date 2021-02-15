import { DateValueConverter } from './../resources/date-value-converter';
import { CustomerRequest } from 'shared/types/customer-request';
import { IRouteableComponent } from '@aurelia/router';
import { ICustomElementViewModel, ILogger, EventAggregator, IDisposable, IRouter } from 'aurelia';
import { editRequest, getRequest, removeRequest } from '../commands/request';
import { Global } from '../global';

export class RequestDetail implements IRouteableComponent, ICustomElementViewModel {

  public static parameters = ['requestId'];

  public requestId: string;
  public request: CustomerRequest;

  private logger: ILogger;
  private subscriptions: IDisposable[] = [];

  public constructor(
    @ILogger iLogger: ILogger, 
    private global: Global) {
    this.logger = iLogger.scopeTo('request-detail-route');
  }

  public load(parameters: {requestId: string}): void {
    this.requestId = parameters.requestId;
  }

  public async binding(): Promise<void> {
    if (!this.global.isRoutingOK()) {
      return;
    }
    await this.getRequest();
    await this.tryToFetchRequest();
    this.subscriptions.push(this.global.eventAggregator.subscribe('page:foreground:auth', async () => {
      await this.tryToFetchRequest();
    }));
  }

  public async attached() {
    
  }

  public unbinding(): void {
    for (const event of this.subscriptions) {
      event.dispose();
    }
    this.subscriptions = [];
  }

  public async getRequest(): Promise<void> {
    try {
      const request = await getRequest(this.requestId)
      // this.request = request;
    } catch (error) {
      this.logger.error(error);
    }
  }

  public async tryToFetchRequest(): Promise<void> {
    try {
      const request = await getRequest(this.requestId, 'network-only');
      // this.request = request;
    } catch (error) {
      // if error, do nothing
    }
  }

  public async removeRequest(): Promise<void> {
    try {
      await removeRequest(this.requestId);
      this.global.router.load('../-@detail');
    } catch (error) {
      this.logger.error(error);
    }
  }

  public async markRequestAs(status: 'closed'): Promise<void> {
    try {
      await editRequest(this.requestId, {status});
      await this.tryToFetchRequest();
    } catch (error) {
      this.logger.error(error);
    }
  }

  public niceDate(date: any, params: any) {
    const dateVm = new DateValueConverter();
    return dateVm.toView(date, params);
  }

}
