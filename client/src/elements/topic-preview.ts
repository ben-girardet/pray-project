import { bindable, IDisposable, ICustomElementViewModel } from 'aurelia';
import { parseColorString } from "@microsoft/fast-components";
import { darkenViaLAB, lightenViaLAB } from "@microsoft/fast-colors";
import { Topic } from 'shared/types/topic';
import { Global } from '../global';

export class TopicPreview implements ICustomElementViewModel {

  @bindable topic: Topic;

  private subscriptions: IDisposable[] = [];
  private isViewed = true;
  private nbUnviewedMessages: number = 0;
  private nbUnviewedPrayers: number = 0;
  private nbUnviewed: number = 0;

  constructor(private element: HTMLElement, private global: Global) {

  }

  public binding() {
    this.subscriptions.push(this.global.eventAggregator.subscribe('unviewed:update', () => {
      this.setUnviewed();
    }));
    this.setUnviewed();
  }

  public unbinding() {
    for (const sub of this.subscriptions) {
      sub.dispose();
    }
    this.subscriptions = [];
  }

  private setUnviewed() {
    this.isViewed = !this.global.notificationService.unviewedTopicIds.includes(this.topic.id);
    this.nbUnviewedMessages = this.global.notificationService.unviewedMessages[this.topic.id]?.length || 0;
    this.nbUnviewedPrayers = this.global.notificationService.unviewedPrayers[this.topic.id]?.length || 0;
    this.nbUnviewed = this.global.notificationService.unviewedNumbers[this.topic.id] || 0;
  }


  public gradient(original: string): string {
    try {
      const color = parseColorString(original);
      const dark = darkenViaLAB(color, 2);
      const light = lightenViaLAB(color, 2);
      return `linear-gradient(135deg, ${dark.toStringWebRGBA()} 0%, ${light.toStringWebRGBA()} 100%);`;
    } catch (error) {
      return original;
    }
  }

  public dispatchEvent(event: string) {
    this.element.dispatchEvent(new CustomEvent(event, {bubbles: true, detail: this.topic}));
  }

}
