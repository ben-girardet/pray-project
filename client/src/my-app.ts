import { IRouter, ICustomElementViewModel, ViewportInstruction, inject, ILogger, EventAggregator, IDisposable } from 'aurelia';
import { parseColorWebRGB } from "@microsoft/fast-colors";
import { createColorPalette, parseColorString } from "@microsoft/fast-components";
import { apolloAuth } from './apollo';
import { PageVisibility } from './helpers/page-visibility';
import { Global } from './global';

const neutral = 'rgb(200, 200, 200)'; // 'rgb(70,51,175)';
// const accent = 'rgb(0,201,219)';
const accent = '#3AC3BD';
const neutralPalette = createColorPalette(parseColorWebRGB(neutral));
const accentPalette = createColorPalette(parseColorString(accent));

@inject()
export class MyApp implements ICustomElementViewModel {

  private logger: ILogger;
  public apolloAuth = apolloAuth;

  public subscriptions: IDisposable[] = [];

  constructor(
    @IRouter private router: IRouter, 
    @ILogger private iLogger: ILogger,
    private eventAggregator: EventAggregator,
    private pageVisibility: PageVisibility,
    private global: Global) {
    this.logger = iLogger.scopeTo('app');
    this.pageVisibility.listen();
  }

  public attached(): void {
    // TODO: enable darkMode later
    const darkMode = false && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const provider = document.querySelector("fast-design-system-provider") as HTMLElement & {backgroundColor: string; neutralPalette: string[]; accentPalette: string[]; accentBaseColor: string};
    if (darkMode) {
      provider.backgroundColor = '#000000';
    }
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
    // TODO: if not authenticated, here is a good
    // place to start authentication (silent try)
    this.subscriptions.push(this.eventAggregator.subscribe('page:foreground', async () => {
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
      if (!['login', 'register'].includes(componentName)) {
        this.router.load('login');
        return false;
      }
    }
    return true;
  }

  

  public async bound(): Promise<void> {
    // Authentication HOOK
    this.router.addHook(async (instructions: ViewportInstruction[]) => {
      this.global.bumpRoute();
      // User is not logged in, so redirect them back to login page
      const mainInstruction = instructions.find(i => i.viewportName === 'main');
      if (mainInstruction && !(await apolloAuth.isAuthenticated())) {
        if (!['login', 'register'].includes(mainInstruction.componentName)) {
          return [this.router.createViewportInstruction('login', mainInstruction.viewport)];
        }
      }
      return true;
    });

    // Add HTML class component HOOK
    this.router.addHook(async (instructions: ViewportInstruction[]) => {
      for (const instruction of instructions) {
      }
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
      include: ['praying', '-', 'topic-form', 'topic-detail', 'conversation', 'sharing', 'friends', 'edit-profile']
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

  public messagesActives(activeComponents: ViewportInstruction[]): boolean {
    return activeComponents.find(c => c.componentName === 'messages') !== undefined;
  }

  public settingsActive(activeComponents: ViewportInstruction[]): boolean {
    this.logger.debug('settingsActive', activeComponents);
    this.logger.debug('activeComponents.find(c => c.componentName === settings)', activeComponents.find(c => c.componentName === 'settings'));
    return activeComponents.find(c => c.componentName === 'settings') !== undefined;
  }

}
