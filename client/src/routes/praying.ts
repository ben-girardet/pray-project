
import { CryptingService } from './../services/crypting-service';
import { AppNotification } from './../components/app-notification';
import { Topic as ITopic } from 'shared/types/topic';
import { MyShare } from 'shared/types/share';
import { IRouteableComponent } from '@aurelia/router';
import { ICustomElementViewModel, ILogger, IDisposable, IRouter } from 'aurelia';
import { getTopics, pray } from '../commands/topic';
import { createColorPalette, parseColorString } from "@microsoft/fast-components";

const neutral = '#16615F';
const accent = '#3AC3BD';
const neutralPalette = createColorPalette(parseColorString(neutral));
const accentPalette = createColorPalette(parseColorString(accent));

export class Praying implements IRouteableComponent, ICustomElementViewModel {

  public static parameters = ['topicId'];
  public startWithTopicId: string = '';

  private playlist: ITopic[] = [];
  private events: IDisposable[] = [];
  private logger: ILogger;

  private currentTopicIndex: number = 0;

  private touchAction: null | 'prayed' | 'skip' | 'close';

  private handleTouchStart: EventListener;
  private handleTouchMove: EventListener;
  private handleTouchStop: EventListener;


  private playlistContainer: HTMLElement;
  private currentTopicTop: 1 | 2 = 1;
  private currentTopicElement: HTMLElement;
  private topic1Element: HTMLElement;
  private topic2Element: HTMLElement;
  private topic1Index: number = 0;
  private topic2Index: number = 0;

  private startTrigger: number = 10;
  private terminateTriggerX: number = 60;
  private terminateTriggerY: number = 90;
  private startTouchX: number = 0;
  private startTouchY: number = 0;
  private touching: boolean = false;
  
  private deltaX: number = 0;
  private deltaY: number = 0;

  public constructor(@IRouter private router: IRouter, @ILogger logger: ILogger) {
    this.logger = logger.scopeTo('praying route');
    this.handleTouchStart = e => {
      e.preventDefault();
      e.stopPropagation();
      this.touching = true;
      this.deltaX = 0;
      this.deltaY = 0;
      this.touchAction = null;
      this.startTouchX = (e as any).touches[0].clientX;
      this.startTouchY = (e as any).touches[0].clientY;
      this.deltaChanged();
      return false;
    };
    this.handleTouchMove = e => {
      e.preventDefault();
      e.stopPropagation();
      this.deltaX = this.startTouchX - (e as any).touches[0].clientX;
      this.deltaY = this.startTouchY - (e as any).touches[0].clientY;

      if (this.touchAction === null) {
        if (this.deltaY > this.startTrigger) this.touchAction = 'prayed';
        else if (this.deltaY < this.startTrigger * -1) this.touchAction = 'close';
        else if (this.deltaX > this.startTrigger) this.touchAction = 'skip';
      }

      this.deltaChanged();
      return false;
    };
    this.handleTouchStop = e => {
      this.touching = false;
      if (this.touchAction === 'prayed' && this.deltaY > this.terminateTriggerY) {
        this.terminateAction();
      } else if (this.touchAction === 'close' && this.deltaY < this.terminateTriggerY * -1) {
        this.terminateAction();
      } else if (this.touchAction === 'skip' && this.deltaX > this.terminateTriggerX) {
        this.terminateAction();
      } else {
        this.cancelAction();
      }
    };
  }

  public load(parameters: {topicId: string}): void {
    this.logger.debug('load', parameters);
    this.startWithTopicId = parameters.topicId;
    this.logger.debug('startWithTopicId', this.startWithTopicId);
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
    p.cornerRadius = 50;
    p.outlineWidth = 1;
    p.focusOutlineWidth = 1;
    p.disabledOpacity = 0.2;

    this.reset();
    this.playlistContainer.addEventListener('touchstart', this.handleTouchStart);
    this.playlistContainer.addEventListener('touchmove', this.handleTouchMove);
    this.playlistContainer.addEventListener('touchend', this.handleTouchStop);
  }

  public detached() {
    this.playlistContainer.removeEventListener('touchstart', this.handleTouchStart);
    this.playlistContainer.removeEventListener('touchmove', this.handleTouchMove);
    this.playlistContainer.removeEventListener('touchend', this.handleTouchStop);
    for (let sub of this.events) {
      sub.dispose();
    }
  }

  private hasNextStory() {
    let minIndex = Math.min(this.topic1Index, this.topic2Index);
    if (minIndex >= this.playlist.length - 1) return false;
    return true;
  }

  public async getTopics(): Promise<void> {
    this.logger.debug('getTopics', this.startWithTopicId);
    try {
      const activeTopics = [].concat(await getTopics({field: 'updatedAt', order: -1}, 'active'));
      shuffleArray(activeTopics);
      if (this.startWithTopicId) {
        const topic = activeTopics.find(t => t.id === this.startWithTopicId);
        this.logger.debug('topic', topic);
        if (topic) {
          const index = activeTopics.indexOf(topic);
          this.logger.debug('index', index);
          activeTopics.unshift(activeTopics.splice(index, 1)[0]);
          this.logger.debug('activeTopics', activeTopics);
        }
        this.startWithTopicId = '';
      }
      this.playlist = await this.decryptTopics(activeTopics);
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

  // public next() {
  //   if (this.currentTopicIndex === this.playlist.length - 1) {
  //     this.close();
  //     return;
  //   }
  //   this.currentTopicIndex++;
  // }

  public async prayed(fromTerminateAction = true) {
    try {
      const index = Math.min(this.topic1Index, this.topic2Index);
      const prayed = await pray(this.playlist[index].id);
      this.touchAction = 'prayed';
      if (!fromTerminateAction) {
        this.terminateAction(true);
      }
    } catch (error) {
      AppNotification.notify(error.message, 'error');
    }
  }

  public close() {
    this.router.load('../-@praying')
  }

  private reset() {
    this.currentTopicElement = this.topic1Element;
    this.topic1Index = 0;
    this.topic2Index = 1;
  }

  private deltaChanged() {
    this.deltaXChanged();
    this.deltaYChanged();
  }

  private deltaXChanged() {
    if (this.touchAction === 'skip') {
      let w = window.innerWidth;
      let delta = Math.min(0, this.deltaX * -1);
      let scale = 1 - (this.deltaX / w / 10);
      let transformStyle = '';
      if (delta) {
        transformStyle = `translate3d(${delta}px, 0, 0) scale(${scale})`;
      }
      this.currentTopicElement.style.transform = transformStyle;
    }
  }

  private deltaYChanged() {
    if (this.touchAction === 'prayed') {
      let h = window.innerHeight;
      let delta = Math.min(0, this.deltaY * -1);
      let scale = 1 - (this.deltaY / h / 10);
      let transformStyle = '';
      if (delta) {
        transformStyle = `translate3d(0, ${delta}px, 0) scale(${scale})`;
      }
      this.currentTopicElement.style.transform = transformStyle;
    }
    if (this.touchAction === 'close') {
      let h = window.innerHeight;
      let delta = Math.max(0, this.deltaY * -1);
      let scale = 1 - (this.deltaY / h / 10 * -1);
      let transformStyle = '';
      if (delta) {
        transformStyle = `translate3d(0, ${delta}px, 0) scale(${scale})`;
      }
      this.playlistContainer.style.transform = transformStyle;
    }
  }

  private cancelAction() {
    let increment = 40;
    requestAnimationFrame(() => {
      if (this.touchAction === 'prayed') {
        if (this.deltaY > 0) {
          this.deltaY = Math.max(this.deltaY - increment, 0);
          this.deltaYChanged();
          this.cancelAction();
        } else {
          this.touchAction = null;
        }
      }
      if (this.touchAction === 'close') {
        if (this.deltaY < 0) {
          this.deltaY = Math.min(this.deltaY + increment, 0);
          this.deltaYChanged();
          this.cancelAction();
        } else {
          this.touchAction = null;
        }
      }
      if (this.touchAction === 'skip') {
        if (this.deltaX > 0) {
          this.deltaX = Math.max(this.deltaX - increment, 0);
          this.deltaXChanged();
          this.cancelAction();
        } else {
          this.touchAction = null;
        }
      }
    });
  }

  private terminateAction(onlyMovement = false) {
    let increment = 40;
    requestAnimationFrame(() => {
      if (this.touchAction === 'prayed') {
        if (this.deltaY < window.innerHeight) {
          this.deltaY += increment;
          this.deltaYChanged();
          this.terminateAction();
        } else { 
          if (!onlyMovement) {
            this.prayed();
          }
          this.enableNextTopic();
        }
      }
      if (this.touchAction === 'close') {
        if (this.deltaY > window.innerHeight * -1) {
          this.close();
//          ActivityHelper.logActivity(null, null, 'stop-praying', 'touch');
          setTimeout(() => {
            this.deltaX = 0;
            this.deltaY = 0;
          }, 500);
        }
      }
      if (this.touchAction === 'skip') {
        if (this.deltaX < window.innerHeight) {
          this.deltaX += increment;
          this.deltaXChanged();
          this.terminateAction();
        } else {
          this.skipped();
          this.enableNextTopic();
        }
      }
    });
  }

  private skipped() {
    // TODO: log skipped
  }

  private enableNextTopic() {
    this.deltaX = 0;
    this.deltaY = 0;
    this.currentTopicElement.style.transform = '';
    if (this.hasNextStory()) {
      if (this.currentTopicTop === 1) {
        this.topic1Index = this.topic2Index + 1;
        this.currentTopicElement = this.topic2Element;
        this.currentTopicTop = 2;
      } else {
        this.topic2Index = this.topic1Index + 1;
        this.currentTopicElement = this.topic1Element;
        this.currentTopicTop = 1;
      }
    } else {
      this.close();
      // TODO: log end of playlist
    }
  }


}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
}
