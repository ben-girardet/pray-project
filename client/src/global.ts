import { apolloAuth } from './apollo';
import { EventAggregator, ILogger, IRouter, IPlatform, ViewportInstruction, inject } from 'aurelia';
import { NotificationService } from './services/notification-service';
import { HelpId } from 'shared/types/user';
import { helpViewed } from './commands/user';
import { I18N } from '@aurelia/i18n';
import moment from 'moment';

const w: any = window;
@inject(EventAggregator, ILogger, IRouter, IPlatform, NotificationService, I18N)
export class Global {

  private firstRouteIgnored:  -1 | 0 | 1 = -1;
  private logger: ILogger;
  public isCordova = false;
  public isDarkModeEnabled = false;
  public apollo = apolloAuth;
  public includeMyActivity = false;

  public constructor(
    public eventAggregator: EventAggregator, 
    @ILogger iLogger: ILogger,
    @IRouter public router: IRouter,
    @IPlatform public platform: IPlatform,
    public notificationService: NotificationService,
    public i18n: I18N) {
    this.logger = iLogger.scopeTo('global');
    this.isCordova = document.documentElement.classList.contains('cordova');
    this.setMomentLocale();
    this.eventAggregator.subscribe('i18n:locale:changed', () => {
      // at the time of writing this code
      // the i18n:locale:changed is never received
      // therefore I've set another event below 'app:locale:changed'
      // called when changing locale
      this.setMomentLocale();
    });
    this.eventAggregator.subscribe('app:locale:changed', () => {
      this.setMomentLocale();
    });
    this.eventAggregator.subscribe('app:started', () => {
      this.setMomentLocale();
    });
  }

  public setMomentLocale() {
    const locale = this.i18n.getLocale();
    moment.locale(locale);
  }

  public isRoutingOK() {
    return this.firstRouteIgnored === 1;
  }

  public bumpRoute() {
    if (this.firstRouteIgnored === -1) {
      this.firstRouteIgnored = 0;
    } else if (this.firstRouteIgnored === 0) {
      this.firstRouteIgnored = 1;
    }
  }

  public adaptProviderWithTheme() {
    if (!this.isCordova) {
      this.isDarkModeEnabled = false;
      return;
    }
    this.isDarkModeEnabled = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const provider = document.querySelector("fast-design-system-provider") as HTMLElement & {backgroundColor: string; neutralPalette: string[]; accentPalette: string[]; accentBaseColor: string};
    if (!provider) {
      return;
    }
    if (this.isDarkModeEnabled) {
      provider.backgroundColor = '#000000';
    } else {
      provider.backgroundColor = '#FFFFFF';
    }
  }

  public adaptStatusBarWithThemeAndRoute(instructions: ViewportInstruction[]) {
    if (!this.isCordova) {
      return;
    }
    if (instructions.length === 0) {
      instructions = this.router.activeComponents;
    }
    const blackOpaqueComps = [];
    if (!this.isDarkModeEnabled) {
      blackOpaqueComps.push('topic-detail', 'praying', 'sharing');
    }
    const blackOpaqueInstructions = instructions.find(i => blackOpaqueComps.includes(i.componentName));
    if (blackOpaqueInstructions) {
      w.StatusBar.styleBlackOpaque()
    } else {
      w.StatusBar.styleDefault()
    }
  }

  public async helpViewed(helpId: HelpId): Promise<boolean> {
    return await helpViewed(helpId);
  }
}
