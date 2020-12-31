import { apolloAuth } from './../apollo';
import { PageVisibility } from './../helpers/page-visibility';
import { CryptingService } from './../services/crypting-service';
import { AppNotification } from './../components/app-notification';
import { Topic as ITopic } from 'shared/types/topic';
import { MyShare } from 'shared/types/share';
import { IRouteableComponent } from '@aurelia/router';
import { Global } from '../global';
import { ICustomElementViewModel, ILogger, EventAggregator, IDisposable, IRouter, IPlatform } from 'aurelia';
import easyScroll from 'easy-scroll';
import { getTopics } from '../commands/topic';

export class Topics implements IRouteableComponent, ICustomElementViewModel {

  public activeTopics: ITopic[] = [];
  public answeredTopics: ITopic[] = [];
  public archivedTopics: ITopic[] = [];
  private events: IDisposable[] = [];
  private logger: ILogger;
  public activeTab: 'active' | 'answered' | 'archived' = 'active';
  public activeTopicsTabElement: HTMLElement;

  public constructor( 
    @ILogger iLogger: ILogger,
    private global: Global) {
    this.logger = iLogger.scopeTo('topics-route');
  }

  public async binding(): Promise<void> {
    if (!this.global.isRoutingOK()) {
      return;
    }
    // version with a query get topics
    this.global.platform.macroTaskQueue.queueTask(async () => {
      await this.getTopics();
      await this.tryToFetchTopics();
    });
    this.events.push(this.global.eventAggregator.subscribe('topic-form-out', async () => {
      await this.tryToFetchTopics();
    }));
    this.events.push(this.global.eventAggregator.subscribe('topic-detail-out', async () => {
      await this.tryToFetchTopics();
      if (this.activeTab === 'archived' && this.archivedTopics.length === 0) {
        this.activeTopicsTabElement.click();
      }
      if (this.activeTab === 'answered' && this.answeredTopics.length === 0) {
        this.activeTopicsTabElement.click();
      }
    }));
    this.events.push(this.global.eventAggregator.subscribe('praying-out', async () => {
      await this.tryToFetchTopics();
    }));
    this.events.push(this.global.eventAggregator.subscribe('page:foreground:auth', async () => {
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
    // this.global.router.load(`../conversation(topicId=${topic.id})`);
  }

  public openSharing(topic: ITopic) {
    // this.global.router.load(`../sharing(${topic.id})`);
  }

}
