import { IContainer, inject, Aurelia  } from 'aurelia';
import { IAttrSyntaxTransformer, NodeObserverLocator, AppTask } from '@aurelia/runtime-html';

console.log('aurelia-fast-adapter', 'here');

export class AureliaFastAdapter {

  public static register(container: IContainer) {
    AureliaFastAdapter.extendTemplatingSyntax(container);
  }

  private static extendTemplatingSyntax(container) {
    console.log('extendTemplatingSyntax');
    AppTask.with(IContainer).beforeCreate().call(container => {
      console.log('extendTemplatingSyntax', container);
      const attrSyntaxTransformer = container.get(IAttrSyntaxTransformer);
      const nodeObserverLocator = container.get(NodeObserverLocator);
      attrSyntaxTransformer.useTwoWay((el, property) => {
        console.log('useTwoWay', el, property);
        switch (el.tagName) {
          case 'FAST-SLIDER':
          case 'FAST-TEXT-FIELD':
          case 'FAST-TEXT-AREA':
            return property === 'value';
          case 'FAST-CHECKBOX':
          case 'FAST-RADIO':
          case 'FAST-RADIO-GROUP':
          case 'FAST-SWITCH':
            return property === 'checked';
          case 'FAST-TABS':
            return property === 'activeid';
          default:
            return false;
        }
      });
      // Teach Aurelia what events to use to observe properties of elements.
      // Because FAST components all use a single change event to notify,
      // we can use a single common object
      const valuePropertyConfig = { events: ['change'] };
      nodeObserverLocator.useConfig({
        'FAST-CHECKBOX': {
          value: valuePropertyConfig
        },
        'FAST-RADIO': {
          value: valuePropertyConfig
        },
        'FAST-RADIO-GROUP': {
          value: valuePropertyConfig
        },
        'FAST-SLIDER': {
          value: valuePropertyConfig
        },
        'FAST-SWITCH': {
          value: valuePropertyConfig
        },
        'FAST-TABS': {
          value: valuePropertyConfig
        },
        'FAST-TEXT-FIELD': {
          value: valuePropertyConfig
        },
        'FAST-TEXT-AREA': {
          value: valuePropertyConfig
        }
      });
    }).register(container);
  }

}