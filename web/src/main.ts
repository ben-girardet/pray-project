import Aurelia, { RouterConfiguration, LoggerConfiguration, LogLevel, ColorOptions } from 'aurelia';
import { MyApp } from './my-app';

import { 
  FASTDesignSystemProvider, 
  FASTDialog
} from '@microsoft/fast-components';

FASTDesignSystemProvider;
FASTDialog;

Aurelia
  .register(RouterConfiguration)
  // .register(LoggerConfiguration.create({$console: console, level: LogLevel.debug, colorOptions: ColorOptions.noColors}))
  .app(MyApp)
  .start();
