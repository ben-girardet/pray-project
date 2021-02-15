import { bindable, IDisposable, ICustomElementViewModel } from 'aurelia';
import { parseColorString } from "@microsoft/fast-components";
import { darkenViaLAB, lightenViaLAB } from "@microsoft/fast-colors";
import { CustomerRequest } from 'shared/types/customer-request';
import { Global } from '../global';

export class RequestPreview implements ICustomElementViewModel {

  @bindable request: CustomerRequest;

  private subscriptions: IDisposable[] = [];

  constructor(private element: HTMLElement, private global: Global) {

  }

  public binding() {
    
  }

  public unbinding() {
    for (const sub of this.subscriptions) {
      sub.dispose();
    }
    this.subscriptions = [];
  }

}
