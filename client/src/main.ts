import Aurelia, { RouterConfiguration, LoggerConfiguration, LogLevel, ColorOptions } from 'aurelia';
import { TopicPreview } from './elements/topic-preview';
import { MyApp } from './my-app';
import { DateValueConverter } from './resources/date-value-converter';
import { GradientValueConverter } from './resources/gradient-value-converter';
import { FileValueConverter } from './resources/file-value-converter';
import { AvatarSelection } from './elements/avatar-selection';
import { MiniUser } from './elements/mini-user';

import { 
  FASTDesignSystemProvider, 
  FASTAnchor,
  FASTCard, 
  FASTButton,
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
PrayIcon;
PrayList;
PrayListItem;
PrayGrid;
PrayGridItem;
PraySearchInput;

Aurelia
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
