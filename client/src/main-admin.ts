import Aurelia, { RouterConfiguration, LoggerConfiguration, LogLevel, ColorOptions } from 'aurelia';
import { RequestPreview } from './elements/request-preview';
import { i18nConf } from './i18n.conf';
import { AdminApp } from './admin-app';
import { DateValueConverter } from './resources/date-value-converter';
import { Nl2brValueConverter } from './resources/nl2br-value-converter';
import { AvatarSelection } from './elements/avatar-selection';
import { MiniUser } from './elements/mini-user';
import { AureliaFastAdapter } from './aurelia-fast-adapter';
import { TwoWayCe } from './two-way-ce';

import { 
  FASTDesignSystemProvider, 
  FASTAnchor,
  FASTBadge,
  FASTCard, 
  FASTButton,
  FASTCheckbox,
  FASTDivider,
  FASTTextField,
  FASTTextArea,
  FASTDialog,
  FASTOption,
  FASTSelect,
  FASTTabs,
  FASTTab,
  FASTTabPanel,
  FASTMenu,
  FASTMenuItem,
  FASTSwitch,
  FASTProgressRing 
} from '@microsoft/fast-components';

/*
 * Ensure that tree-shaking doesn't remove these components from the bundle.
 * There are multiple ways to prevent tree shaking, of which this is one.
 */
FASTDesignSystemProvider;
FASTAnchor;
FASTBadge;
FASTCard;
FASTButton;
FASTCheckbox;
FASTDivider;
FASTTextField;
FASTTextArea;
FASTDialog;
FASTSelect;
FASTOption;
FASTTabs;
FASTTab;
FASTTabPanel;
FASTMenu;
FASTMenuItem;
FASTSwitch;
FASTProgressRing;

import { PrayIcon } from './components/pray-icon';
import { PrayList } from './components/pray-list';
import { PrayListItem } from './components/pray-list-item';
import { PrayGrid } from './components/pray-grid';
import { PrayGridItem } from './components/pray-grid-item';
import { PraySearchInput } from './components/pray-search-input';
import { PrayLogo } from './components/pray-logo';
import { PrayHelpContainer } from './components/pray-help-container';
PrayIcon;
PrayList;
PrayListItem;
PrayGrid;
PrayGridItem;
PraySearchInput;
PrayLogo;
PrayHelpContainer;

Aurelia
  .register(i18nConf())
  .register(AureliaFastAdapter)
  .register(TwoWayCe)
  .register(RouterConfiguration)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .register(LoggerConfiguration.create({$console: console, level: LogLevel.debug, colorOptions: ColorOptions.noColors}))
  // To use HTML5 pushState routes, replace previous line with the following
  // customized router config.
  // .register(RouterConfiguration.customize({ useUrlFragmentHash: false }))
  .register(DateValueConverter)
  .register(Nl2brValueConverter)
  .register(AvatarSelection)
  .register(RequestPreview)
  .register(MiniUser)
  // To use HTML5 pushState routes, replace previous line with the following
  // customized router config.
  // .register(RouterConfiguration.customize({ useUrlFragmentHash: false }))
  .app(AdminApp)
  .start();
