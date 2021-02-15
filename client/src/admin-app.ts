import { IRouter, ICustomElementViewModel, ViewportInstruction, inject, ILogger, EventAggregator, IDisposable } from 'aurelia';
import { HookTypes } from '@aurelia/router';
import { parseColorWebRGB } from "@microsoft/fast-colors";
import { createColorPalette, parseColorString } from "@microsoft/fast-components";
import { apolloAuth, client } from './apollo';
import { PageVisibility } from './helpers/page-visibility';
import { Global } from './global';
import { HelpId } from 'shared/types/user';
import { gql } from 'apollo-boost';

const neutral = 'rgb(200, 200, 200)'; // 'rgb(70,51,175)';
// const accent = 'rgb(0,201,219)';
const accent = '#3AC3BD';
const neutralPalette = createColorPalette(parseColorWebRGB(neutral));
const accentPalette = createColorPalette(parseColorString(accent));

const w: any = window;
@inject()
export class AdminApp implements ICustomElementViewModel {

  private logger: ILogger;
  public apolloAuth = apolloAuth;

  public subscriptions: IDisposable[] = [];
  private started = false;

  public prayingHelp: 'welcome' | 'direction' | '' = '';

  constructor(
    @IRouter private router: IRouter, 
    @ILogger private iLogger: ILogger,
    private eventAggregator: EventAggregator,
    private pageVisibility: PageVisibility,
    private global: Global) {
    apolloAuth.client = 'admin';
    this.logger = iLogger.scopeTo('app');
    this.pageVisibility.listen();
    const roots = ['https://sunago.app', 'https://sunago.app/', 'https://sunago.app/#', 'https://sunago.app/#/']
    if (roots.includes(location.href)) {
      this.global.bumpRoute();
    }
    if (
      location.href.substr(-25) === 'Sunago.app/www/index.html'
      || location.href.substr(-26) === 'Sunago.app/www/index.html/'
      || location.href.substr(-27) === 'Sunago.app/www/index.html/#'
      || location.href.substr(-28) === 'Sunago.app/www/index.html/#/'
      ) {
      this.global.bumpRoute();
    }
    document.addEventListener("deviceready", () => {
      this.global.eventAggregator.publish('device:ready');
    }, false);

  }

  public attached(): void {
    this.global.adaptProviderWithTheme();
    const provider = document.querySelector("fast-design-system-provider") as HTMLElement & {backgroundColor: string; neutralPalette: string[]; accentPalette: string[]; accentBaseColor: string};
    provider.neutralPalette = neutralPalette;
    provider.accentBaseColor = accent;
    provider.accentPalette = accentPalette;
    const p: any = provider;
    // p.density = 10;
    // p.designUnit = 10;
    p.cornerRadius = 10;
    p.outlineWidth = 1;
    p.focusOutlineWidth = 1;
    p.disabledOpacity = 0.2;
  }

  public async binding(): Promise<void> {
    this.subscriptions.push(this.eventAggregator.subscribe('page:foreground', async () => {
      this.global.platform.domReadQueue.queueTask(() => {
        this.global.adaptProviderWithTheme();
        this.global.adaptStatusBarWithThemeAndRoute([]);
      });
      this.global.platform.setTimeout(() => {
        this.global.adaptProviderWithTheme();
        this.global.adaptStatusBarWithThemeAndRoute([]);
      }, 250);
      const isAuth = await this.loginIfNotAuthenticated();
      if (isAuth) {
        this.eventAggregator.publish('page:foreground:auth')
      }
    }));
  }

  public async loginIfNotAuthenticated(): Promise<boolean> {
    if (!(await apolloAuth.isAuthenticated())) {
      const vp = this.router.getViewport('main');
      const componentName = vp.content.content.componentName;
      if (!['start'].includes(componentName)) {
        this.router.load('start');
      }
      return false;
    }
    return true;
  }

  public async bound(): Promise<void> {    
    this.router.addHook(async (title: string | ViewportInstruction[]) => {
      return 'Sunago Admin';
    }, {
      type: HookTypes.SetTitle
    });
    // Authentication HOOK
    this.router.addHook(async (instructions: ViewportInstruction[]) => {
      this.global.bumpRoute();
      // User is not logged in, so redirect them back to login page
      const mainInstruction = instructions.find(i => i.viewportName === 'main');
      if (mainInstruction && !(await apolloAuth.isAuthenticated())) {
        if (!['start'].includes(mainInstruction.componentName)) {
          return [this.router.createViewportInstruction('start', mainInstruction.viewport)];
        }
      }
      if (!this.started) {
        this.started = true;
        this.global.eventAggregator.publish('app:started');
      }
      return true;
    });

    // Cordova StatusBar hook
    this.router.addHook(async (instructions: ViewportInstruction[]) => {
      this.global.adaptProviderWithTheme();
      this.global.adaptStatusBarWithThemeAndRoute(instructions);
      this.global.platform.domReadQueue.queueTask(() => {
        this.global.adaptStatusBarWithThemeAndRoute([]);
      });
      return true;
    });

    // View type HOOK
    this.router.addHook(async (instructions: ViewportInstruction[]) => {
      const bottomInstruction = instructions.find(i => i.viewportName === 'bottom');
      const detailInstruction = instructions.find(i => i.viewportName === 'detail');
      const bottomViewport = this.router.getViewport('bottom');
      const detailViewport = this.router.getViewport('detail');
      if (bottomInstruction) {
        if (bottomInstruction.componentName === '-') {
          document.documentElement.classList.remove('bottom');
          this.eventAggregator.publish(`${bottomViewport.content.content.componentName}-out`);
        } else {
          document.documentElement.classList.add('bottom');
          this.eventAggregator.publish(`${bottomViewport.content.content.componentName}-in`);
        }
      }
      if (detailInstruction) {
        if (detailInstruction.componentName === '-') {
          document.documentElement.classList.remove('detail');
          this.eventAggregator.publish(`${detailViewport.content.content.componentName}-out`);
        } else {
          document.documentElement.classList.add('detail');
          this.eventAggregator.publish(`${detailViewport.content.content.componentName}-in`);
        }
      }
      return true;
    }, {
      include: ['-', 'request-detail']
    });
  }

  public unbind() {
    for (const sub of this.subscriptions) {
      sub.dispose();   
    }
    this.subscriptions = [];
  }

  public requestsActive(activeComponents: ViewportInstruction[]): boolean {
    return activeComponents.find(c => c.componentName === 'admin-requests') !== undefined;
  }

  public settingsActive(activeComponents: ViewportInstruction[]): boolean {
    return activeComponents.find(c => c.componentName === 'admin-settings') !== undefined;
  }

  public statsActive(activeComponents: ViewportInstruction[]): boolean {
    return activeComponents.find(c => c.componentName === 'admin-stats') !== undefined;
  }

}
