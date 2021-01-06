import { bindable, IDisposable, ICustomElementViewModel } from 'aurelia';
import { Activity } from 'shared/types/activity';
import { Global } from '../global';

export class ActivityPreview implements ICustomElementViewModel {

  @bindable activity: Activity;

  private subscriptions: IDisposable[] = [];

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
    // TODO: setUnviewed in activity
  }

  public dispatchEvent(event: string) {
    this.element.dispatchEvent(new CustomEvent(event, {bubbles: true, detail: this.activity}));
  }

}
