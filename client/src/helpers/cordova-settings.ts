const w: any = window;

export class CordovaSettings {

  public static debug = false;

  public static async open(setting: 'notification_id' | 'wifi') {
    
    if (w.cordova && w.cordova.plugins.settings) {
      CordovaSettings.log('openNativeSettingsTest is active');
      w.cordova.plugins.settings.open(setting, function() {
        CordovaSettings.log('opened settings');
          },
          function () {
            CordovaSettings.log('failed to open settings');
          }
      );
  } else {
    CordovaSettings.warn('openNativeSettingsTest is not active!');
  }
  }

  public static info(message: any, ...params) {
    if (!CordovaSettings.debug) {
      return;
    }
    console.info(message, ...params);
  }

  public static log(message: any, ...params) {
    if (!CordovaSettings.debug) {
      return;
    }
    console.log(message, ...params);
  }

  public static warn(message: any, ...params) {
    if (!CordovaSettings.debug) {
      return;
    }
    console.warn(message, ...params);
  }
}

w.CordovaSettings = CordovaSettings;
