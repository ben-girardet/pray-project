import { Activity as IActivity } from 'shared/types/activity';
import { IRouteableComponent } from '@aurelia/router';
import { ICustomElementViewModel, IDisposable, ILogger } from 'aurelia';
import { Global } from '../global';
import { CryptingService } from './../services/crypting-service';
import { AppNotification } from './../components/app-notification';
import easyScroll from 'easy-scroll';
import { getActivities } from '../commands/activity';

export class Activity implements IRouteableComponent, ICustomElementViewModel {

  public activeTab = 'activity';
  public activities: IActivity[] = [];
  private events: IDisposable[] = [];
  private logger: ILogger;
  public loadingTopics = false;

  public constructor( 
    @ILogger iLogger: ILogger,
    private global: Global) {
    this.logger = iLogger.scopeTo('activity-route');
  }

  public tabChanged(event: Event) {
    this.activeTab = (event as any).detail.id;
  }

  public async binding(): Promise<void> {
    if (!this.global.isRoutingOK()) {
      return;
    }
    // version with a query get topics
    this.loadingTopics = true;
    this.global.platform.macroTaskQueue.queueTask(async () => {
      await this.getActivities();
      await this.tryToFetchActivities();
      this.loadingTopics = false;
    });
    this.events.push(this.global.eventAggregator.subscribe('praying-out', async () => {
      await this.tryToFetchActivities();
    }));
    this.events.push(this.global.eventAggregator.subscribe('page:foreground:auth', async () => {
      await this.tryToFetchActivities();
    }));
  }

  public detaching(): void {
    for (const event of this.events) {
      event.dispose();
    }
    this.events = [];
  }

  public async getActivities(): Promise<void> {
    try {
      const activities = await getActivities();
      this.activities = await this.decryptActivities(activities);
    } catch (error) {
      this.logger.error(error);
    }
  }

  public async tryToFetchActivities(): Promise<void> {
    try {
      const activities = await getActivities('network-only');
      this.activities = await this.decryptActivities(activities);
    } catch (error) {
      // if error, do nothing
    }
  }

  public async decryptActivities(activities: IActivity[]): Promise<IActivity[]> {
    const decryptedActivities: IActivity[] = [];
    for (const activity of activities) {
      try {
        // await CryptingService.decryptTopic(topic);
        decryptedActivities.push(activity);
      } catch (error) {
        AppNotification.notify(error.message, 'error');
      }
    }
    return decryptedActivities;
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

}
