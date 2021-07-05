import { EventAggregator, ILogger } from 'aurelia';

export class PageVisibility {

  public enableLogs: boolean = false;
  private hidden: string;
  private visibilityChange: string;
  private logger: ILogger;

  public constructor(@ILogger iLogger: ILogger, private eventAggregator: EventAggregator) {
    this.logger = iLogger.scopeTo('page-visibility');
    this.init();
  }

  private log(message: any, ...params) {
    if (!this.enableLogs) {
      return;
    }
    this.logger.debug(message, ...params);
  }


  private init() {
    this.log('Init');
    if (typeof document.hidden !== 'undefined') {
      this.hidden = 'hidden';
      this.visibilityChange = 'visibilitychange';
    } else if (typeof (document as any).msHidden !== 'undefined') {
      this.hidden = 'msHidden';
      this.visibilityChange = 'msvisibilitychange';
    } else if (typeof (document as any).webkitHidden !== 'undefined') {
      this.hidden = 'webkitHidden';
      this.visibilityChange = 'webkitvisibilitychange';
    }
    this.log('hidden:', this.hidden);
    this.log('visibilityChange:', this.visibilityChange);
  }

  public listen() {
    this.log('Listen');
    if (!this.hidden) {
      this.init()
    }

    // Warn if the browser doesn't support addEventListener or the Page Visibility API
    if (typeof document.addEventListener === 'undefined' || typeof document.hidden === 'undefined') {
      this.logger.warn('Page Visibility API not supported');
    } else {
      // Handle page visibility change
      document.addEventListener(this.visibilityChange, () => {
        if (document[this.hidden]) {
          this.log('Page is now hidden');
          this.eventAggregator.publish('page:background');
        } else {
          this.log('Page is now visibile');
          this.eventAggregator.publish('page:foreground');
        }
      }, false);
    }
  }

  public isHidden() {
    return document[this.hidden];
  }
}
