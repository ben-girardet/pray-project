import { PageVisibility } from './../helpers/page-visibility';
import { CryptingService } from './../services/crypting-service';
import { AppNotification } from './../components/app-notification';
import { Topic as ITopic } from 'shared/types/topic';
import { MyShare } from 'shared/types/share';
import { IRouteableComponent } from '@aurelia/router';
import { IViewModel, ILogger, EventAggregator, IDisposable, IRouter, IPlatform } from 'aurelia';
import easyScroll from 'easy-scroll';
import { getTopics } from '../commands/topic';

export class Topics implements IRouteableComponent, IViewModel {

  public activeTopics: ITopic[] = [];
  public answeredTopics: ITopic[] = [];
  public archivedTopics: ITopic[] = [];
  private events: IDisposable[] = [];
  private logger: ILogger;
  public activeTab: 'active' | 'answered' | 'archived' = 'active';
  public activeTopicsTabElement: HTMLElement;

  public constructor(
    private eventAggregator: EventAggregator, 
    @ILogger iLogger: ILogger,
    @IRouter private router: IRouter,
    @IPlatform private platform: IPlatform,
    private pageVisibility: PageVisibility) {
    this.logger = iLogger.scopeTo('topics-route');
  }

  public async binding(): Promise<void> {
    // version with a query get topics
    this.platform.macroTaskQueue.queueTask(async () => {
      await this.getTopics();
      await this.tryToFetchTopics();
    })
    this.events.push(this.eventAggregator.subscribe('topic-form-out', async () => {
      await this.tryToFetchTopics();
    }));
    this.events.push(this.eventAggregator.subscribe('topic-detail-out', async () => {
      await this.tryToFetchTopics();
      if (this.activeTab === 'archived' && this.archivedTopics.length === 0) {
        this.activeTopicsTabElement.click();
      }
      if (this.activeTab === 'answered' && this.answeredTopics.length === 0) {
        this.activeTopicsTabElement.click();
      }
    }));
    this.events.push(this.eventAggregator.subscribe('praying-out', async () => {
      await this.tryToFetchTopics();
    }));
    this.events.push(this.eventAggregator.subscribe('page:foreground', async () => {
      await this.tryToFetchTopics();
    }));
  }

  public detaching(): void {
    for (const event of this.events) {
      event.dispose();
    }
    this.events = [];
  }

  public async getTopics(): Promise<void> {
    try {
      const activeTopics = await getTopics({field: 'updatedAt', order: -1}, 'active');
      this.activeTopics = await this.decryptTopics(activeTopics);
      const answeredTopics = await getTopics({field: 'updatedAt', order: -1}, 'answered');
      this.answeredTopics = await this.decryptTopics(answeredTopics);
      const archivedTopics = await getTopics({field: 'updatedAt', order: -1}, 'archived');
      this.archivedTopics = await this.decryptTopics(archivedTopics);
    } catch (error) {
      this.logger.error(error);
    }
  }

  public async tryToFetchTopics(): Promise<void> {
    try {
      const activeTopics = await getTopics({field: 'updatedAt', order: -1}, 'active', 'network-only');
      this.activeTopics = await this.decryptTopics(activeTopics);
      const answeredTopics = await getTopics({field: 'updatedAt', order: -1}, 'answered', 'network-only');
      this.answeredTopics = await this.decryptTopics(answeredTopics);
      const archivedTopics = await getTopics({field: 'updatedAt', order: -1}, 'archived', 'network-only');
      this.archivedTopics = await this.decryptTopics(archivedTopics);
    } catch (error) {
      // if error, do nothing
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

  public openMessages(topic: ITopic) {
    this.router.load(`../conversation(topicId=${topic.id})`);
  }

  public openSharing(topic: ITopic) {
    this.router.load(`../sharing(${topic.id})`);
  }

}
