import { IContainer, IAttrSyntaxTransformer, NodeObserverLocator, AppTask } from 'aurelia';

export class TwoWayCe {

  public static register(container: IContainer) {
    TwoWayCe.extendTemplatingSyntax(container);
  }

  private static extendTemplatingSyntax(container) {
    AppTask.with(IContainer).beforeCreate().call(container => {
      const attrSyntaxTransformer = container.get(IAttrSyntaxTransformer);
      const nodeObserverLocator = container.get(NodeObserverLocator);
      attrSyntaxTransformer.useTwoWay((el, property) => {
        switch (el.tagName) {
          case 'PRAY-SEARCH-INPUT':
            return property === 'value';
          default:
            return false;
        }
      });
      // Teach Aurelia what events to use to observe properties of elements.
      // Because FAST components all use a single change event to notify,
      // we can use a single common object
      const valuePropertyConfig = { events: ['change'] };
      nodeObserverLocator.useConfig({
        'PRAY-SEARCH-INPUT': {
          value: valuePropertyConfig
        }
      });
    }).register(container);
  }

}
