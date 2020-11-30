
import { CryptingService } from './../services/crypting-service';
import { AppNotification } from './../components/app-notification';
import { Topic as ITopic } from 'shared/types/topic';
import { MyShare } from 'shared/types/share';
import { IRouteableComponent } from '@aurelia/router';
import { IViewModel, ILogger, IDisposable, IRouter } from 'aurelia';
import { getTopics, pray } from '../commands/topic';
import { createColorPalette, parseColorString } from "@microsoft/fast-components";

const neutral = '#16615F';
const accent = '#3AC3BD';
const neutralPalette = createColorPalette(parseColorString(neutral));
const accentPalette = createColorPalette(parseColorString(accent));

export class Praying implements IRouteableComponent, IViewModel {

  private activeTopics: ITopic[] = [];
  private events: IDisposable[] = [];
  private logger: ILogger;

  private currentTopicIndex: number = 0;

  public constructor(@IRouter private router: IRouter) {

  }

  public async binding(): Promise<void> {
    await this.getTopics();
  }

  public attached(): void {
    const provider = document.querySelector("fast-design-system-provider.praying") as HTMLElement & {backgroundColor: string; neutralPalette: string[]; accentPalette: string[]; accentBaseColor: string};
    provider.neutralPalette = neutralPalette;
    provider.accentBaseColor = accent;
    provider.accentPalette = accentPalette;
    const p: any = provider;
    p.density = 4;
    // p.density = 10;
    // p.designUnit = 10;
    p.cornerRadius = 50;
    p.outlineWidth = 1;
    p.focusOutlineWidth = 1;
    p.disabledOpacity = 0.2;
  }

  public async getTopics(): Promise<void> {
    try {
      const activeTopics = [].concat(await getTopics({field: 'updatedAt', order: -1}, 'active'));
      shuffleArray(activeTopics);
      this.activeTopics = await this.decryptTopics(activeTopics);
      this.currentTopicIndex = 0;
    } catch (error) {
      this.logger.error(error);
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

  public next() {
    if (this.currentTopicIndex === this.activeTopics.length - 1) {
      this.close();
      return;
    }
    this.currentTopicIndex++;
  }

  public async prayed() {
    try {
      const prayed = await pray(this.activeTopics[this.currentTopicIndex].id);
      this.next();
    } catch (error) {
      AppNotification.notify(error.message, 'error');
    }
  }

  public close() {
    this.router.load('../-@praying')
  }

}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
}