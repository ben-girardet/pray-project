import { AppNotification } from './../components/app-notification';
// import '@havesource/cordova-plugin-push/types';
import { EventAggregator, ILogger } from 'aurelia';

export class Push {

  public push: PhonegapPluginPush.PushNotification;
  public permission: boolean | undefined = undefined;
  public regId: string;
  private logger: ILogger

  public constructor(private eventAggregator: EventAggregator, @ILogger logger: ILogger) {
    this.logger = logger.scopeTo('push');
  }

  public init() {
    this.logger.debug('init');
    this.push = PushNotification.init({
      ios: {
        alert: true,
        badge: true,
        sound: true,
      }
    });
    this.listen();
  }

  public async hasPermission(): Promise<boolean> {
    this.logger.debug('hasPersmission');
    try {
      this.permission = await new Promise((resolve, reject) => {
        PushNotification.hasPermission((data) => {
          this.logger.debug('hasPermission data', data);
          resolve(data.isEnabled);
        }, () => {
          this.logger.debug('hasPermission errored');
          reject();
        });
      });
    } catch (error) {
      this.permission = undefined;
    }
    return this.permission;
  }

  public listen() {
    this.logger.debug('listen');
    this.push.on('registration', (data) => {
      this.logger.debug('registration', data);
      this.regId = data.registrationId;
      this.eventAggregator.publish('push:registration', data);
    });

    this.push.on('notification', (data) => {
      this.logger.debug('notification', data);
      this.eventAggregator.publish('push:notification', data);
    });

    this.push.on('error', (error) => {
      this.logger.error(error);
      AppNotification.notify(error.message, 'error');
    });
  }

  public clearAllNotifications(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.push.clearAllNotifications(() => {
        resolve();
      }, reject);
    });
  }

  public setApplicationIconBadgeNumber(number: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.push.setApplicationIconBadgeNumber(() => {
        resolve();
      }, reject, number);
    });
  }
}
