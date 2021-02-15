import { Token } from 'shared/types/token';
import { apolloAuth, client } from './../apollo';
import { gql } from 'apollo-boost';
import { AvatarSelection } from './../elements/avatar-selection';
import { IRouteableComponent } from '@aurelia/router';
import { ICustomElementViewModel, IRouter, ILogger, IDisposable } from 'aurelia';
import { AppNotification } from '../components/app-notification';
import PhoneNumber from 'awesome-phonenumber';
import { requestMobileCode, validateCode } from '../commands/register';
import { editMe } from '../commands/user';
// TODO: remove all instances of /server/ in shared or client
import { Image } from '../../../server/src/models/image';
import { Global } from '../global';
import { Push } from '../helpers/push';
import { CordovaSettings } from '../helpers/cordova-settings';

export class Start implements IRouteableComponent, ICustomElementViewModel {

  private step: 'welcome' | 'mobile' | 'validate' | 'identity' = 'welcome';
  private mobile = '';
  private regionCode = 'ch';
  private isMobileValid = false;
  private countryCode: number;
  private validationCode: string = '';
  private invalidCode = false;
  private firstname = '';
  private lastname = '';
  public preview: string;

  private token: Token;
  private userId: string;
  
  private avatar: AvatarSelection;
  private apolloAuth = apolloAuth;
  private loading = false;
  
  private logger: ILogger;

  private mainComponent: 'topics' | 'admin-requests' = 'topics';

  public constructor(
    @IRouter private router: IRouter, 
    @ILogger iLogger: ILogger,
    private global: Global,
    private push: Push
    ) {
    this.logger = iLogger.scopeTo('register route');
  }

  public async binding(): Promise<void> {
    if (apolloAuth.client === 'admin') {
      this.mainComponent = 'admin-requests';
    }
    if (apolloAuth.authenticated && apolloAuth.getState() === 1) {
      this.router.load(this.mainComponent);
    } else {
      client.clearStore();
    }
  }

  public load(parameters: any): void {
    console.log('start', this.mainComponent);
    if (parameters[0] === 'identity') {
      this.step = 'identity';
    }
    setTimeout(() => {
      // this.next('notification');
    }, 500);
  }

  public async attached() {
    if (!this.global.isRoutingOK()) {
      return;
    }
    this.countryChanged();
    const starts = document.querySelectorAll('start');
    const start = starts.length === 2 ? starts[1] : starts[0];
    if (starts.length === 2) {
      (starts[0] as HTMLElement).style.display = 'none';
    }
    start.classList.add('start-container');
  }

  private transitioning = false;

  public async prev(step: string) {
    if (this.transitioning) {
      return;
    }
    try {
      this.transitioning = true;
      const stepElement = document.querySelector(`.start-container .start-${step}`);
      const currentElement = document.querySelector(`.start-container .start--current`);
      if (!stepElement || !currentElement) {
        return;
      }
      stepElement.classList.add('start--prev');
      await new Promise(resolve => setTimeout(resolve, 200));
      stepElement.classList.add('start--showing');
      stepElement.addEventListener('transitionend', () => {
        currentElement.classList.remove('start--current');
        stepElement.classList.add('start--current');
        this.setPrevNext();
      }, {once: true});
    } catch (error) {
      // what should we do ??
    }
    this.transitioning = false;
  }

  public async next(step: string) {
    if (this.transitioning) {
      return;
    }
    try {
      this.transitioning = true;
      const stepElement = document.querySelector(`.start-container .start-${step}`);
      const currentElement = document.querySelector(`.start-container .start--current`);
      if (!stepElement || !currentElement) {
        return;
      }
      stepElement.classList.add('start--next');
      await new Promise(resolve => setTimeout(resolve, 200));
      stepElement.classList.add('start--showing');
      stepElement.addEventListener('transitionend', () => {
        currentElement.classList.remove('start--current');
        stepElement.classList.add('start--current');
        this.setPrevNext();
      }, {once: true});
    } catch (error) {
      // what should we do ??
    }
    this.transitioning = false;
  }

  private setPrevNext() {
    const currentElement = document.querySelector(`.start-container .start--current`);
    if (currentElement instanceof HTMLElement) {
      currentElement.classList.remove('start--showing');
      currentElement.classList.remove('start--next');
      currentElement.classList.remove('start--prev');
      this.setNext(currentElement);
      this.setPrev(currentElement);
    }
  }

  private setNext(el: HTMLElement) {
    const sib = el.nextElementSibling;
    if (sib instanceof HTMLElement) {
      sib.classList.remove('start--current');
      sib.classList.remove('start--prev');
      sib.classList.add('start--next');
      this.setNext(sib);
    }
  }

  private setPrev(el: HTMLElement) {
    const sib = el.previousElementSibling;
    if (sib instanceof HTMLElement) {
      sib.classList.remove('start--current');
      sib.classList.remove('start--next');
      sib.classList.add('start--prev');
      this.setPrev(sib);
    }
  }

  public countryChanged() {
    this.countryCode = PhoneNumber.getCountryCodeForRegionCode(this.regionCode);
    this.mobileChanged();
  }

  public mobileChanged() {
    this.isMobileValid = new PhoneNumber(this.mobile, this.regionCode).isValid();
  }

  public async requestMobileCode(event: Event | null, again = false): Promise<any> {
    if (event) {
      event.preventDefault();
    }
    if (this.loading) {
      return false;
    }
    this.loading = true;
    if (!this.mobile) {
      AppNotification.notify('Please enter a valid mobile number', 'info');
      return;
    }
    try {
      const pn = new PhoneNumber(this.mobile, this.regionCode);
      if (!pn.isValid()) {
        throw new Error('Please enter a valid mobile number');
      }
      this.token = await requestMobileCode(pn.getNumber());
      if (!again) {
        this.next('validation');
      } else {
        AppNotification.notify('The code has been sent again', 'success');
      }
    } catch (error) {
      if (error.message.includes('No correct phone numbers')) {
        error = new Error('Invalid phone number');
      }
      AppNotification.notify(error.message, 'info');
    }
    this.loading = false;
    return false;
  }

  public codeChanged() {
    if (this.validationCode.length === 6) {
      this.validateCode(null, true);
    }
  }

  public validationField: HTMLElement;
  public async validateCode(event: Event | null, silent = false): Promise<any> {
    if (event) {
      event.preventDefault();
    }
    if (this.loading) {
      return false;
    }
    this.loading = true;
    try {
      if (this.validationCode.length !== 6) {
        throw new Error('Validation code must have 6 digits');
      }
      await validateCode(this.token.token, this.validationCode);
      this.validationField.blur();
      await this.getIdentity();
      this.next('identity');
    } catch (error) {
      if (!silent) {
        if (error.message.includes('Token not found')) {
          error = new Error('Invalid code');
          this.invalidCode = true;
        }
        AppNotification.notify(error.message, 'info');
      }
    }
    this.loading = false;
    return false;
  }

  public async getIdentity(): Promise<void> {
    if (!apolloAuth.getUserId()) {
      return null
    }
    try {
      const result = await client.query<{user: {
        id: string,
        firstname: string, 
        lastname: string, 
        picture: {fileId: string, width: number, height: number}[]}}>({query: gql`query User($userId: String!) {
  user(id: $userId) {
    id,
    firstname,
    lastname,
    picture {
      fileId,
      width,
      height
    }
  }
      }`, variables: {userId: apolloAuth.getUserId()}, fetchPolicy: 'network-only'});
      this.firstname = result.data.user.firstname;
      this.lastname = result.data.user.lastname;
      this.preview = result.data.user.picture && result.data.user.picture.length ? result.data.user.picture.find(i => i.height > 50 && i.width > 50).fileId : '';
    } catch (error) {
      // do nothing
    }
  }

  public async setIdentity(event: Event | null): Promise<any> {
    if (event) {
      event.preventDefault();
    }
    if (this.loading) {
      return false;
    }
    this.loading = true;
    try {
      const editUserData: {firstname?: string, lastname?: string, picture?: Image[]} = {};
      editUserData.firstname = this.firstname;
      editUserData.lastname = this.lastname;
      if (this.avatar) {
        if (this.avatar.avatar === 'image') {
          const imageData = await this.avatar.imageService.publish();
          if (imageData !== 'no-change') {
            editUserData.picture = [
              {fileId: imageData.small, width: 40, height: 40},
              {fileId: imageData.medium, width: 100, height: 1000},
              {fileId: imageData.large, width: 1000, height: 1000},
            ]
          }
        } else if (this.avatar.avatar !== 'original') {
          editUserData.picture = [
            {fileId: `static:${this.avatar.avatar}.gif`, width: 40, height: 40},
            {fileId: `static:${this.avatar.avatar}.gif`, width: 100, height: 100},
            {fileId: `static:${this.avatar.avatar}.gif`, width: 1000, height: 1000},
          ];
        }
      }
      await editMe(editUserData.firstname, editUserData.lastname, editUserData.picture);
      const w: any = window;
      if (w.device?.platform === 'iOS') {
        this.next('notification');
      } else {
        this.router.load(this.mainComponent);
      }
    } catch (error) {
      AppNotification.notify(error.message, 'info');
    }
    this.loading = false;
    return false;
  }

  public notificationPrayer = true;
  public notificationAnswer = true;
  public notificationMessage = false;  
  private notificationsTags: string[] = [];
  private regSub: IDisposable;

  public async setNotification(event: Event) {
    if (event) {
      event.preventDefault();
    }
    if (this.loading) {
      return false;
    }
    this.loading = true;
    try {


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
        // this should trigger a request from the app
        
        // TODO: here we must add a listener for 'push-registration'
        // from there we get the registrationId and we can set the right
        // tags to the player, linked to the userId
        if (this.regSub) {
          this.regSub.dispose();
          delete this.regSub;
        }
        this.regSub = this.global.eventAggregator.subscribeOnce('push:registration', async (data: PhonegapPluginPush.RegistrationEventResponse) => {
          this.toggleDisabledNotificationDialog(false);
          await editMe(undefined, undefined, undefined, data.registrationId, this.push.regType, this.notificationsTags, true);
          this.router.load(this.mainComponent);
        });
        this.push.init();
        const enabled = await this.push.hasPermission();
        if (enabled === true) {
          // if enabled => we set the user/player/regid
        } else if (enabled === false) {
          // here we should display a screen/info
          // explaining that notifications have been disabled for
          // this app and that the user should go
          // in the settings to enable them again
          this.toggleDisabledNotificationDialog(true);
        } else {
          // if unknown, let's see what we can do ?
          // probably wait for registration
        }
      } else {
        if (this.regSub) {
          this.regSub.dispose();
          delete this.regSub;
        }
        await editMe(undefined, undefined, undefined, '', undefined, [], false);
        this.router.load(this.mainComponent);
      }
    } catch (error) {
      AppNotification.notify(error.message, 'error');
    }

    this.loading = false;
    return false;
  }

  public skipNotifications() {
    this.toggleDisabledNotificationDialog(false);
    if (this.regSub) {
      this.regSub.dispose();
      delete this.regSub;
    }
    this.router.load(this.mainComponent);
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
