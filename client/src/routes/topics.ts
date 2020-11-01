import { ITopic, GunTopic, StateService } from './../services/internals';
import { IRouteableComponent } from '@aurelia/router';
import { IViewModel, ILogger, EventAggregator, IDisposable } from 'aurelia';
import easyScroll from 'easy-scroll';

export class Topics implements IRouteableComponent, IViewModel {

  private activeTopics: ITopic[] = [];
  private answeredTopics: ITopic[] = [];
  private archivedTopics: ITopic[] = [];
  public prayImageSrc = './images/pray-button.png';
  private events: IDisposable[] = [];
  private logger: ILogger;
  public activeTab = 'active';

  public constructor(public gunTopic: GunTopic, private stateService: StateService, private eventAggregator: EventAggregator, @ILogger iLogger: ILogger) {
    this.logger = iLogger.scopeTo('topics-route');
  }

  public async beforeBind(): Promise<void> {
    await this.getTopics();
    this.events.push(this.eventAggregator.subscribe('topic-form-out', async () => {
      await this.getTopics();
    }));
    this.events.push(this.eventAggregator.subscribe('topic-detail-out', async () => {
      await this.getTopics();
    }));
  }

  public afterDetach(): void {
    for (const event of this.events) {
      event.dispose();
    }
    this.events = [];
  }

  public async getTopics(): Promise<void> {
    try {
      this.activeTopics = await this.gunTopic.getTopics(this.stateService.userId, this.stateService.pair, '-lastUpdateDate', 'active');
      this.answeredTopics = await this.gunTopic.getTopics(this.stateService.userId, this.stateService.pair, '-lastUpdateDate', 'answered');
      this.archivedTopics = await this.gunTopic.getTopics(this.stateService.userId, this.stateService.pair, '-lastUpdateDate', 'archived');
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