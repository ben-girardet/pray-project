import { apolloAuth } from './apollo';
import { EventAggregator, ILogger, IRouter, IPlatform, ViewportInstruction } from 'aurelia';
import { NotificationService } from './services/notification-service';
import { HelpId } from 'shared/types/user';
import { helpViewed } from './commands/user';

const w: any = window;
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
    public notificationService: NotificationService) {
    this.logger = iLogger.scopeTo('global');
    this.isCordova = document.documentElement.classList.contains('cordova');
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
