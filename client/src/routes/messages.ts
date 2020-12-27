import { IRouteableComponent } from '@aurelia/router';
import { ICustomElementViewModel } from 'aurelia';
import { Global } from '../global';

export class Messages implements IRouteableComponent, ICustomElementViewModel {

  public activeTab = 'messages';

  public constructor(private global: Global) {
    
  }

  public tabChanged(event: Event) {
    this.activeTab = (event as any).detail.id;
  }

}
