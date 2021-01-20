import { IContainer, IAttrSyntaxTransformer, NodeObserverLocator, AppTask } from 'aurelia';

export class AureliaFastAdapter {

  public static register(container: IContainer) {
    AureliaFastAdapter.extendTemplatingSyntax(container);
  }

  private static extendTemplatingSyntax(container) {
    AppTask.with(IContainer).beforeCreate().call(container => {
      const attrSyntaxTransformer = container.get(IAttrSyntaxTransformer);
      const nodeObserverLocator = container.get(NodeObserverLocator);
      attrSyntaxTransformer.useTwoWay((el, property) => {
        switch (el.tagName) {
          case 'FAST-SELECT':
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
      const valuePropertyConfig = { events: ['input', 'change'] };
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
        'FAST-SELECT': {
          value: valuePropertyConfig
        },
        'FAST-SLIDER': {
          value: valuePropertyConfig
        },
        'FAST-SWITCH': {
          checked: valuePropertyConfig
        },
        'FAST-TABS': {
          activeid: valuePropertyConfig
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
