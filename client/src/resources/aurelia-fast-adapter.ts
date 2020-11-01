import { IObserverLocator, BindingMode, LifecycleFlags, IScheduler } from 'aurelia';
import { ISyntaxInterpreter } from '@aurelia/jit';
import { IBindingTargetObserver, IDOM } from '@aurelia/runtime';
import { ValueAttributeObserver, EventSubscriber } from '@aurelia/runtime-html';

export type GetElementObserver = (
  obj: Element,
  propertyName: string,
  observerLocator: IObserverLocator,
  descriptor?: PropertyDescriptor | null) => IBindingTargetObserver | null;

export interface FastElementObserverAdapter {
  tagName: string;
  properties: Record<string, FastElementPropertyObserver>;
}

export interface FastElementPropertyObserver {
  defaultBindingMode: BindingMode;
  getObserver: GetElementObserver;
}

export class AureliaFastAdapter {

  private bindingModeIntercepted = false;
  private adapterCreated = false;
  private adapters: Record<string, FastElementObserverAdapter> = {};

  public constructor(private observerLocator: IObserverLocator, private syntaxInterpreter: ISyntaxInterpreter, private scheduler: IScheduler, private dom: IDOM) {

  }

  private createAdapter() {
    this.observerLocator.addAdapter({
      getObserver: (flags: LifecycleFlags, obj: Element, propertyName: string, descriptor: PropertyDescriptor) => {
        if (obj instanceof Element) {
          const tagName = obj.getAttribute('as-element') || obj.tagName;
          const elAdapters = this.adapters[tagName];
          if (!elAdapters) {
            return null;
          }
          const propertyAdapter = elAdapters.properties[propertyName];
          if (propertyAdapter) {
            const observer = propertyAdapter.getObserver(obj, propertyName, this.observerLocator, descriptor);
            if (observer) {
              return observer;
            }
          }
        }
        return null;
      }
    });
  }

  private getOrCreateFastElementAdapters(tagName: string): FastElementObserverAdapter {
    if (!this.adapterCreated) {
      this.createAdapter();
      this.adapterCreated = true;
    }
    const adapters = this.adapters;
    let elementAdapters = adapters[tagName] || adapters[tagName.toLowerCase()];
    if (!elementAdapters) {
      elementAdapters = adapters[tagName] = adapters[tagName.toLowerCase()] = { tagName, properties: {} };
    }
    return elementAdapters;
  }

  private interceptDetermineDefaultBindingMode(): void {
    // I totally need help here
    this.syntaxInterpreter.add({
      pattern: '',
      symbols: ''
    });
  }

  public addFastElementObserverAdapter(tagName: string, properties: Record<string, FastElementPropertyObserver>): void {
    if (!this.adapterCreated) {
      this.createAdapter();
      this.adapterCreated = true;
    }
    const elementAdapters = this.getOrCreateFastElementAdapters(tagName);
    Object.assign(elementAdapters.properties, properties);
  }

  public registerFastElementConfig(observerAdapter: FastElementObserverAdapter): void {
    if (!this.bindingModeIntercepted) {
      this.interceptDetermineDefaultBindingMode();
      this.bindingModeIntercepted = true;
    }
    this.addFastElementObserverAdapter(observerAdapter.tagName.toUpperCase(), observerAdapter.properties);
  }

  public registerFastElementTwoWaysProperties(tagname: string, properties: string[]): void {
    const config: FastElementObserverAdapter = {
      tagName: tagname,
      properties: {}
    };
    for (const property of properties) {
      const propertyConfig: FastElementPropertyObserver = {
        defaultBindingMode: BindingMode.twoWay,
        getObserver(element: Element) {
          const node: any = element; // have no idea if this is correct
          return new ValueAttributeObserver(this.scheduler, LifecycleFlags.none, new EventSubscriber(this.dom, ['change']), node, property);
        }
      }
      config.properties[property] = propertyConfig;
    }
  }
}