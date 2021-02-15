import { AppNotification } from './../components/app-notification';
import { CustomerRequest } from 'shared/types/customer-request';
import { IRouteableComponent } from '@aurelia/router';
import { Global } from '../global';
import { ICustomElementViewModel, ILogger, IDisposable } from 'aurelia';
import easyScroll from 'easy-scroll';
import { getRequests } from '../commands/request';

export class AdminRequests implements IRouteableComponent, ICustomElementViewModel {

  public openedRequests: CustomerRequest[] = [];
  public closedRequests: CustomerRequest[] = [];
  private events: IDisposable[] = [];
  private logger: ILogger;
  public activeTab: 'opened' | 'closed' = 'opened';
  public openRequestsTabElement: HTMLElement;
  public loadingRequests = false;

  public constructor( 
    @ILogger iLogger: ILogger,
    private global: Global) {
    this.logger = iLogger.scopeTo('requests-route');
  }

  public load() {
    console.log('load admin-requests');
  }

  public async binding(): Promise<void> {
    if (!this.global.isRoutingOK()) {
      return;
    }
    // version with a query get topics
    this.loadingRequests = true;
    this.global.platform.macroTaskQueue.queueTask(async () => {
      await this.getRequests();
      await this.tryToFetchRequests();
      this.loadingRequests = false;
    });
    this.events.push(this.global.eventAggregator.subscribe('request-detail-out', async () => {
      await this.tryToFetchRequests();
    }));
    this.events.push(this.global.eventAggregator.subscribe('page:foreground:auth', async () => {
      await this.tryToFetchRequests();
    }));
  }

  public detaching(): void {
    for (const event of this.events) {
      event.dispose();
    }
    this.events = [];
  }

  public async getRequests(): Promise<void> {
    try {
      const openedRequests = await getRequests({field: 'updatedAt', order: -1}, 'opened');
      this.openedRequests = openedRequests;
      const closedRequests = await getRequests({field: 'updatedAt', order: -1}, 'closed');
      this.closedRequests = closedRequests;
    } catch (error) {
      this.logger.error(error);
    }
  }

  public async tryToFetchRequests(): Promise<void> {
    try {
      const openedRequests = await getRequests({field: 'updatedAt', order: -1}, 'opened', 'network-only');
      this.openedRequests = openedRequests;
      const closedRequests = await getRequests({field: 'updatedAt', order: -1}, 'closed', 'network-only');
      this.closedRequests = closedRequests;
    } catch (error) {
      // if error, do nothing
    }
  }

  public scrollToTop(): void {
    const vp = document.querySelector('au-viewport[name=main]');
    if (vp instanceof HTMLElement) {
      easyScroll({
        scrollableDomEle: vp,
        direction: 'top',
        duration: 250,
        easingPreset: 'easeInQuad',
        scrollAmount: vp.scrollTop
      });
      // vp.scrollTop = 0;
      // const scrolling = new AnimateTo(vp, {scrollTop: 0});
    }
  }

  public tabChanged(event: Event) {
    this.activeTab = (event as any).detail.id;
  }

}
