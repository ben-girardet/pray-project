import { AppNotification } from './../components/app-notification';
import { IRouteableComponent } from '@aurelia/router';
import { ICustomElementViewModel, inject, IRouter, IDisposable } from 'aurelia';
import { apolloAuth, client } from './../apollo';
// TODO: remove all instances of /server/ in shared or client
import { editMe } from '../commands/user';
import { gql } from 'apollo-boost';
import { Global } from '../global';
import { Push } from '../helpers/push';
import { CordovaSettings } from '../helpers/cordova-settings';

@inject()
export class NotificationsSettings implements IRouteableComponent, ICustomElementViewModel {

  public notificationPrayer = true;
  public notificationAnswer = true;
  public notificationMessage = true;  
  private notificationsTags: string[] = ['prayer', 'answer', 'message'];
  private regSub: IDisposable;
  private saving = false;

  public constructor(
    @IRouter private router: IRouter, 
    private global: Global,
    private push: Push) {
    
  }

  public async binding(): Promise<void> {
    const user = await this.getUser();
    if (user.player && !user.player.active) {
      this.notificationsTags = []
    } else if (user.player && user.player.tags) {
      this.notificationsTags = user.player.tags;
    }
    this.notificationPrayer = this.notificationsTags.includes('prayer');
    this.notificationAnswer = this.notificationsTags.includes('answer');
    this.notificationMessage = this.notificationsTags.includes('message');
  }

  public async getUser(): Promise<{id: string, player: {active: boolean, tags: string[]}}> {
    if (!apolloAuth.getUserId()) {
      return null
    }
    const result = await client.query<{me: {
      id: string,
      player: {
        active: boolean,
        tags: string[]
      }
    }}>(
      {
        query: gql`query Me {
me {
  id,
  player {
    tags,
    active
  }
}
    }`, variables: {userId: apolloAuth.getUserId()}, fetchPolicy: 'no-cache'});
    return result.data.me;
  }

  public attached(): void {
    
  }

  public async save(): Promise<void> {
    
    if (this.saving) {
      return;
    }
    this.saving = true;
    try {

      console.log('save');

      this.notificationsTags = [];
  
      if (this.notificationPrayer) {
        this.notificationsTags.push('prayer');
      }
      if (this.notificationAnswer) {
        this.notificationsTags.push('answer');
      }
      if (this.notificationMessage) {
        this.notificationsTags.push('message');
      }
  
      if (this.notificationsTags.length) {
        console.log('some notif selected', this.notificationsTags);
        // this should trigger a request from the app
        console.log('setting a subscribeOnce event');
        if (this.regSub) {
          this.regSub.dispose();
          delete this.regSub;
        }
        this.regSub = this.global.eventAggregator.subscribeOnce('push:registration', async (data: PhonegapPluginPush.RegistrationEventResponse) => {
          console.log('receiving push:registration event', data);
          this.toggleDisabledNotificationDialog(false);
          await editMe(undefined, undefined, undefined, data.registrationId || '', this.push.regType, this.notificationsTags, true);
          console.log('end editMe');
          this.router.load('../-@bottom');
        });
        this.push.init();
        console.log('Call for hasPermission')
        const enabled = await this.push.hasPermission();
        if (enabled === true) {
          // if enabled => we set the user/player/regid
          console.log('Push enabled', this.push);
          await editMe(undefined, undefined, undefined, this.push.regId || '', this.push.regType, this.notificationsTags, true);
          this.router.load('../-@bottom');
        } else if (enabled === false) {
          // here we should display a screen/info
          // explaining that notifications have been disabled for
          // this app and that the user should go
          // in the settings to enable them again
          console.log('Push disabled', this.push);
          this.toggleDisabledNotificationDialog(true);
        } else {
          // if unknown, let's see what we can do ?
          // probably wait for registration
          console.log('Push unsure', this.push);;
        }
      } else {
        console.log('no notif selected');
        if (this.regSub) {
          this.regSub.dispose();
          delete this.regSub;
        }
        await editMe(undefined, undefined, undefined, '', undefined, [], false);
        this.router.load('../-@bottom');
      }
    } catch (error) {
      AppNotification.notify(error.message, 'error');
    }

    this.saving = false;
  }
  
  public cancel(): void {
    this.router.load('../-@bottom');
  }

  private disabledNotificationDialog: HTMLElement;
  public toggleDisabledNotificationDialog(force?: boolean) {
    if (force !== undefined) {
      force = !force;
    }
    this.disabledNotificationDialog.toggleAttribute('hidden', force);
  }

  public openNotificationsSettings() {
    this.toggleDisabledNotificationDialog(false);
    CordovaSettings.open('notification_id');
  }

  

}
