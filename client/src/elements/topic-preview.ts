import { bindable } from 'aurelia';
import { parseColorString } from "@microsoft/fast-components";
import { darkenViaLAB, lightenViaLAB } from "@microsoft/fast-colors";
import { Topic } from 'shared/types/topic';

export class TopicPreview {

  @bindable topic: Topic;

  constructor(private element: HTMLElement) {

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