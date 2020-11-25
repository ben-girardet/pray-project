import { IRouteableComponent } from '@aurelia/router';
import { IViewModel } from 'aurelia';

export class Messages implements IRouteableComponent, IViewModel {

  public activeTab = 'messages';

  public tabChanged(event: Event) {
    this.activeTab = (event as any).detail.id;
  }

}