import Aurelia, { RouterConfiguration, LoggerConfiguration, LogLevel, ColorOptions, IContainer } from 'aurelia';
import { IAttrSyntaxTransformer, INodeObserverLocator, AppTask } from '@aurelia/runtime-html';
import { TopicPreview } from './elements/topic-preview';
import { MyApp } from './my-app';
import { DateValueConverter } from './resources/date-value-converter';
import { GradientValueConverter } from './resources/gradient-value-converter';
import { FileValueConverter } from './resources/file-value-converter';
import { AvatarSelection } from './elements/avatar-selection';
import { MiniUser } from './elements/mini-user';
import { AureliaFastAdapter } from './aurelia-fast-adapter';

import { 
  FASTDesignSystemProvider, 
  FASTAnchor,
  FASTCard, 
  FASTButton,
  FASTCheckbox,
  FASTTextField,
  FASTTextArea,
  FASTDialog,
  FASTTabs,
  FASTTab,
  FASTTabPanel,
  FASTMenu,
  FASTMenuItem 
} from '@microsoft/fast-components';

/*
 * Ensure that tree-shaking doesn't remove these components from the bundle.
 * There are multiple ways to prevent tree shaking, of which this is one.
 */
FASTDesignSystemProvider;
FASTAnchor;
FASTCard;
FASTButton;
FASTCheckbox
FASTTextField;
FASTTextArea;
FASTDialog;
FASTTabs;
FASTTab;
FASTTabPanel;
FASTMenu;
FASTMenuItem;

import { PrayIcon } from './components/pray-icon';
import { PrayList } from './components/pray-list';
import { PrayListItem } from './components/pray-list-item';
import { PrayGrid } from './components/pray-grid';
import { PrayGridItem } from './components/pray-grid-item';
import { PraySearchInput } from './components/pray-search-input';
import { PrayLogo } from './components/pray-logo';
PrayIcon;
PrayList;
PrayListItem;
PrayGrid;
PrayGridItem;
PraySearchInput;
PrayLogo;

console.log('main', AureliaFastAdapter);

Aurelia
  .register(AppTask.with(IContainer).beforeCreate().call(container => {
    const attrSyntaxTransformer = container.get(IAttrSyntaxTransformer);
    const nodeObserverLocator = container.get(INodeObserverLocator);
    attrSyntaxTransformer.useTwoWay((el, property) => {
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
    (nodeObserverLocator as any).useConfig({
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
  }))
  .register(RouterConfiguration)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .register(LoggerConfiguration.create({$console: console, level: LogLevel.debug, colorOptions: ColorOptions.noColors}))
  // To use HTML5 pushState routes, replace previous line with the following
  // customized router config.
  // .register(RouterConfiguration.customize({ useUrlFragmentHash: false }))
  .register(DateValueConverter)
  .register(FileValueConverter)
  .register(GradientValueConverter)
  .register(AvatarSelection)
  .register(TopicPreview)
  .register(MiniUser)
  // To use HTML5 pushState routes, replace previous line with the following
  // customized router config.
  // .register(RouterConfiguration.customize({ useUrlFragmentHash: false }))
  .app(MyApp)
  .start();
