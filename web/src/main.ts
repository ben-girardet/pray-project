import Aurelia, { RouterConfiguration, LoggerConfiguration, LogLevel, ColorOptions } from 'aurelia';
import { MyApp } from './my-app';
import 'jquery';
import 'popper.js';
import 'bootstrap';

import { 
  FASTDesignSystemProvider, 
  FASTDialog
} from '@microsoft/fast-components';
FASTDesignSystemProvider;
FASTDialog;

import { 
  PrayIcon
} from './components/pray-icon';
PrayIcon;

Aurelia
  // .register(RouterConfiguration)
  .register(RouterConfiguration.customize({ useUrlFragmentHash: false }))
  // .register(LoggerConfiguration.create({$console: console, level: LogLevel.debug, colorOptions: ColorOptions.noColors}))
  .app(MyApp)
  .start();
