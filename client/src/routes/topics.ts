import { CryptingService } from './../services/crypting-service';
import { AppNotification } from './../components/app-notification';
import { Topic as ITopic } from 'shared/types/topic';
import { MyShare } from 'shared/types/share';
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
      const activeTopics = await getTopics({field: 'updatedAt', order: -1}, 'active');
      const answeredTopics = await getTopics({field: 'updatedAt', order: -1}, 'answered');
      const archivedTopics = await getTopics({field: 'updatedAt', order: -1}, 'archived');
      this.activeTopics = await this.decryptTopics(activeTopics);
      this.answeredTopics = await this.decryptTopics(answeredTopics);
      this.archivedTopics = await this.decryptTopics(archivedTopics);
    } catch (error) {
      this.logger.error(error);
    }
  }

  public async decryptTopics(topics: (ITopic & MyShare)[]): Promise<(ITopic & MyShare)[]> {
    const decryptedTopics: (ITopic & MyShare)[] = [];
    for (const topic of topics) {
      try {
        await CryptingService.decryptTopic(topic);
        decryptedTopics.push(topic);
      } catch (error) {
        AppNotification.notify(error.message, 'error');
      }
    }
    return decryptedTopics;
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