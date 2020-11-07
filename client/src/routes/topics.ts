import { Topic as ITopic } from 'shared/types/topic';
import { IRouteableComponent } from '@aurelia/router';
import { IViewModel, ILogger, EventAggregator, IDisposable } from 'aurelia';
import easyScroll from 'easy-scroll';
import { getTopics, getTopicsQuery } from '../commands/topic';
import { client } from '../apollo';

export class Topics implements IRouteableComponent, IViewModel {

  private activeTopics: ITopic[] = [];
  private answeredTopics: ITopic[] = [];
  private archivedTopics: ITopic[] = [];
  public prayImageSrc = './images/pray-button.png';
  private events: IDisposable[] = [];
  private logger: ILogger;
  public activeTab = 'active';

  public constructor(private eventAggregator: EventAggregator, @ILogger iLogger: ILogger) {
    this.logger = iLogger.scopeTo('topics-route');
  }

  public async binding(): Promise<void> {
    // version with a query get topics
    await this.getTopics();
    this.events.push(this.eventAggregator.subscribe('topic-form-out', async () => {
      await this.getTopics();
    }));
    this.events.push(this.eventAggregator.subscribe('topic-detail-out', async () => {
      await this.getTopics();
    }));

    // trying watch version
    // this.setWatch();
  }

  // public loading = false;
  // private sub: ZenObservable.Subscription;
  // private async setWatch() {
  //   this.unsetWatch();
  //   const observer = await client.watchQuery({query: getTopicsQuery, variables: {sort: {field: 'lastUpdateDate', order: -1}}});
  //   const sub = observer.subscribe((xx) => {
  //     console.log('result from subscribe', xx)
  //     this.loading = xx.loading;
  //     this.activeTopics = xx.data.topics;
  //   });
  //   this.sub = sub;
  // }

  // private unsetWatch() {
  //   if (this.sub) {
  //     this.sub.unsubscribe();
  //     delete this.sub;
  //   }
  // }

  public detaching(): void {
    for (const event of this.events) {
      event.dispose();
    }
    this.events = [];
    // this.unsetWatch();
  }

  public async getTopics(): Promise<void> {
    try {
      this.activeTopics = await getTopics({field: 'lastUpdateDate', order: -1}, 'active');
      this.answeredTopics = await getTopics({field: 'lastUpdateDate', order: -1}, 'answered');
      this.archivedTopics = await getTopics({field: 'lastUpdateDate', order: -1}, 'archived');
    } catch (error) {
      this.logger.error(error);
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