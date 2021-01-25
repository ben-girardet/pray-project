import { Activity as IActivity } from 'shared/types/activity';
import { IRouteableComponent } from '@aurelia/router';
import { ICustomElementViewModel, IDisposable, ILogger } from 'aurelia';
import { Global } from '../global';
import { AppNotification } from './../components/app-notification';
import easyScroll from 'easy-scroll';
import { getActivities } from '../commands/activity';

export class Activity implements IRouteableComponent, ICustomElementViewModel {

  public activeTab = 'activity';
  public activities: IActivity[] = [];
  private events: IDisposable[] = [];
  private logger: ILogger;
  public loadingActivities = false;
  private limit = 30;
  public displayedActivities: IActivity[] = [];

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
    this.loadingActivities = true;
    this.global.platform.macroTaskQueue.queueTask(async () => {
      await this.getActivities();
      await this.tryToFetchActivities();
      this.setDisplayedActivities();
      this.loadingActivities = false;
    });
    this.events.push(this.global.eventAggregator.subscribe('praying-out', async () => {
      await this.tryToFetchActivities();
      this.setDisplayedActivities();
    }));
    this.events.push(this.global.eventAggregator.subscribe('page:foreground:auth', async () => {
      // await this.tryToFetchActivities();
    }));
  }

  public attached() {
    const vp = document.querySelector('au-viewport[name=main]');
    if (vp) {
      vp.addEventListener('scroll', this);
    }
  }

  private increasing = false;
  public handleEvent(event: Event) {
    if (this.increasing || this.limit === this.activities.length) {
      return;
    }
    const vp = event.target as HTMLElement;
    if (vp) {
      if (vp.offsetHeight + vp.scrollTop > vp.scrollHeight - 200) {
        this.increasing = true;
        this.limit += Math.min(this.activities.length, this.limit + 30);
        setTimeout(() => {
          this.increasing = false;
        }, 1000);
      }
    }
  }

  public detached() {
    
  }

  public detaching(): void {
    const vp = document.querySelector('au-viewport[name=main]');
    if (vp) {
      vp.removeEventListener('scroll', this);
    }
    for (const event of this.events) {
      event.dispose();
    }
    this.events = [];
  }

  public async getActivities(): Promise<void> {
    try {
      const activities = await getActivities(null);
      this.activities = await this.decryptActivities(activities);
    } catch (error) {
      this.logger.error(error);
    }
  }

  public async tryToFetchActivities(): Promise<void> {
    try {
      const activities = await getActivities(null, 'network-only');
      this.activities = await this.decryptActivities(activities);
    } catch (error) {
      // if error, do nothing
    }
  }

  private setDisplayedActivities() {
    const displayedActivities: IActivity[] = [];
    for (const activity of this.activities) {
      if (this.global.includeMyActivity || activity.userId !== this.global.apollo.getUserId()) {
        displayedActivities.push(activity);
      }
    }
    this.displayedActivities = displayedActivities;
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

  public openTopic(topicId: string) {
    this.global.router.load(`../topic-detail(${topicId})`);
  }

}
