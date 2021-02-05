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
export class MyApp implements ICustomElementViewModel {

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
      if (!['login', 'start', 'register'].includes(componentName)) {
        this.router.load('start');
      }
      return false;
    }
    return true;
  }

  public async bound(): Promise<void> {    
    // Authentication HOOK
    this.router.addHook(async (title: string | ViewportInstruction[]) => {
      return 'Sunago';
    }, {
        type: HookTypes.SetTitle
    });
    this.router.addHook(async (instructions: ViewportInstruction[]) => {
      this.global.bumpRoute();
      // User is not logged in, so redirect them back to login page
      const mainInstruction = instructions.find(i => i.viewportName === 'main');
      if (mainInstruction && !(await apolloAuth.isAuthenticated())) {
        if (!['login', 'start', 'register'].includes(mainInstruction.componentName)) {
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
      const prayingInstruction = instructions.find(i => i.viewportName === 'praying');
      const bottomInstruction = instructions.find(i => i.viewportName === 'bottom');
      const detailInstruction = instructions.find(i => i.viewportName === 'detail');
      const bottomViewport = this.router.getViewport('bottom');
      const detailViewport = this.router.getViewport('detail');
      if (prayingInstruction) {
        if (prayingInstruction.componentName === 'praying') {
          document.documentElement.classList.add('praying');
          this.eventAggregator.publish(`praying-in`);
          this.shouldDisplayPrayingHelp();
        } else if (prayingInstruction.componentName === '-') {
          document.documentElement.classList.remove('praying');
          this.eventAggregator.publish(`praying-out`);
        }
      }
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
      include: ['praying', '-', 'topic-form', 'topic-detail', 'conversation', 'sharing', 'friends', 'edit-profile', 'notifications-settings']
    });
  }

  public unbind() {
    for (const sub of this.subscriptions) {
      sub.dispose();   
    }
    this.subscriptions = [];
  }

  public topicsActive(activeComponents: ViewportInstruction[]): boolean {
    return activeComponents.find(c => c.componentName === 'topics') !== undefined;
  }

  public accountActive(activeComponents: ViewportInstruction[]): boolean {
    return activeComponents.find(c => c.componentName === 'account') !== undefined;
  }

  public activityActive(activeComponents: ViewportInstruction[]): boolean {
    return activeComponents.find(c => c.componentName === 'activity') !== undefined;
  }

  public settingsActive(activeComponents: ViewportInstruction[]): boolean {
    this.logger.debug('settingsActive', activeComponents);
    this.logger.debug('activeComponents.find(c => c.componentName === settings)', activeComponents.find(c => c.componentName === 'settings'));
    return activeComponents.find(c => c.componentName === 'settings') !== undefined;
  }

  public async shouldDisplayPrayingHelp(): Promise<any> {
    if (!apolloAuth.getUserId()) {
      return null
    }
    const result = await client.query<{user: {
      id: string,
      helpSeen: HelpId[]}}>({query: gql`query User($userId: String!) {
        user(id: $userId) {
          id,
          helpSeen
        }
      }`, variables: {userId: apolloAuth.getUserId()}, fetchPolicy: 'cache-first'});
    if (!result.data.user.helpSeen.includes('praying-directions')) {
      this.prayingHelp = 'welcome';
    }
  }

  public prayingHelpViewed(helpId: HelpId) {
    this.prayingHelp = '';
    this.global.helpViewed(helpId);
  }

}
