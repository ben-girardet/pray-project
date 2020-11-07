import { Topic as ITopic } from 'shared/types/topic';
import { IRouteableComponent } from '@aurelia/router';
import { IViewModel, ILogger, EventAggregator, IDisposable } from 'aurelia';
import easyScroll from 'easy-scroll';
import { getTopics } from '../commands/topic';

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
    await this.getTopics();
    this.events.push(this.eventAggregator.subscribe('topic-form-out', async () => {
      await this.getTopics();
    }));
    this.events.push(this.eventAggregator.subscribe('topic-detail-out', async () => {
      await this.getTopics();
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
      this.activeTopics = await getTopics('-lastUpdateDate', 'active');
      this.answeredTopics = await getTopics('-lastUpdateDate', 'active');
      this.archivedTopics = await getTopics('-lastUpdateDate', 'active');
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