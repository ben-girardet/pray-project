import { IRouter, IViewModel, ViewportInstruction, inject, ILogger, EventAggregator } from 'aurelia';
import { parseColorWebRGB } from "@microsoft/fast-colors";
import { createColorPalette, parseColorString } from "@microsoft/fast-components";
import { apolloAuth } from './apollo';
import conf from './config';

const neutral = 'rgb(200, 200, 200)'; // 'rgb(70,51,175)';
// const accent = 'rgb(0,201,219)';
const accent = '#335BBB';
const neutralPalette = createColorPalette(parseColorWebRGB(neutral));
const accentPalette = createColorPalette(parseColorString(accent));

@inject()
export class MyApp implements IViewModel {

  private logger: ILogger;
  public apolloAuth = apolloAuth;

  public prayImageSrc = './images/pray-button.png';

  constructor(
    @IRouter private router: IRouter, 
    @ILogger private iLogger: ILogger,
    private eventAggregator: EventAggregator) {
    this.logger = iLogger.scopeTo('app');
  }

  public afterAttach(): void {
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.logger.debug('darkMode', darkMode);
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

  public async beforeBind(): Promise<void> {
    // TODO: if not authenticated, here is a good
    // place to start authentication (silent try)
  }

  public async afterBind(): Promise<void> {
    // Authentication HOOK
    this.router.addHook(async (instructions: ViewportInstruction[]) => {
      // User is not logged in, so redirect them back to login page
      const mainInstruction = instructions.find(i => i.viewportName === 'main');
      if (mainInstruction && !apolloAuth.authenticated) {
        if (!['login', 'register'].includes(mainInstruction.componentName)) {
          return [this.router.createViewportInstruction('login', mainInstruction.viewport)];
        }
      }
      return true;
    });

    // Add HTML class component HOOK
    this.router.addHook(async (instructions: ViewportInstruction[]) => {
      for (const instruction of instructions) {
        console.log('instruction', instruction);
      }
      return true;
    });

    // View type HOOK
    this.router.addHook(async (instructions: ViewportInstruction[]) => {
      const prayingInstruction = instructions.find(i => i.viewportName === 'praying');
      const bottomInstruction = instructions.find(i => i.viewportName === 'bottom');
      const detailInstruction = instructions.find(i => i.viewportName === 'detail');
      this.logger.debug('bottomInstruction', bottomInstruction);
      this.logger.debug('detailInstruction', detailInstruction);
      if (prayingInstruction) {
        if (prayingInstruction.componentName === 'praying') {
          document.documentElement.classList.add('praying');
        } else if (prayingInstruction.componentName === '-') {
          document.documentElement.classList.remove('praying');
        }
      }
      if (bottomInstruction) {
        if (bottomInstruction.componentName === 'topic-form') {
          document.documentElement.classList.add('bottom');
        } else if (bottomInstruction.componentName === '-') {
          document.documentElement.classList.remove('bottom');
          this.eventAggregator.publish('topic-form-out');
        }
        if (bottomInstruction.componentName === 'sharing') {
          document.documentElement.classList.add('bottom');
        } else if (bottomInstruction.componentName === '-') {
          document.documentElement.classList.remove('bottom');
          this.eventAggregator.publish('sharing-out');
        }
        if (bottomInstruction.componentName === 'friends') {
          document.documentElement.classList.add('bottom');
        } else if (bottomInstruction.componentName === '-') {
          document.documentElement.classList.remove('bottom');
          this.eventAggregator.publish('friends-out');
        }
        if (bottomInstruction.componentName === 'add-friend') {
          document.documentElement.classList.add('bottom');
        } else if (bottomInstruction.componentName === '-') {
          document.documentElement.classList.remove('bottom');
          this.eventAggregator.publish('add-friend-out');
        }
      }
      if (detailInstruction) {
        if (detailInstruction.componentName === 'topic-detail') {
          document.documentElement.classList.add('detail');
        } else if (detailInstruction.componentName === '-') {
          document.documentElement.classList.remove('detail');
          this.eventAggregator.publish('topic-detail-out');
        }
      }
      return true;
    }, {
      include: ['praying', '-', 'topic-form', 'topic-detail', 'sharing', 'friends']
    });
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