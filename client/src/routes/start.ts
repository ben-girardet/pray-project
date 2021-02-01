import { Token } from 'shared/types/token';
import { apolloAuth, client } from './../apollo';
import { ApolloQueryResult, gql } from 'apollo-boost';
import { AvatarSelection } from './../elements/avatar-selection';
import { IRouteableComponent } from '@aurelia/router';
import { ICustomElementViewModel, IRouter, ILogger } from 'aurelia';
import { AppNotification } from '../components/app-notification';
import PhoneNumber from 'awesome-phonenumber';
import { register, validateRegistration, requestMobileCode, validateCode } from '../commands/register';
import { login } from '../commands/login';
import { editMe } from '../commands/user';
// TODO: remove all instances of /server/ in shared or client
import { Image } from '../../../server/src/models/image';
import { Global } from '../global';
import Phone from 'src/icons/outline/Phone';

export class Start implements IRouteableComponent, ICustomElementViewModel {

  private step: 'welcome' | 'mobile' | 'validate' | 'identity' = 'welcome';
  private mobile = '';
  private regionCode = 'ch';
  private isMobileValid = false;
  private countryCode: number;
  private validationCode: string = '';
  private firstname = '';
  private lastname = '';
  public preview: string;

  // public username = '';
  // public password = '';

  private logger: ILogger;

  // private type: 'email' | 'mobile';
  private token: Token;
  // private code = '';
  private userId: string;

  private avatar: AvatarSelection;
  private apolloAuth = apolloAuth;

  public constructor(
    @IRouter private router: IRouter, 
    @ILogger iLogger: ILogger,
    private global: Global
    ) {
    this.logger = iLogger.scopeTo('register route');
  }

  public async beforeBind(): Promise<void> {
    if (apolloAuth.authenticated) {
      this.router.load('topics');
    }
  }

  public load(parameters: any): void {
    if (parameters[0] === 'identity') {
      this.step = 'identity';
    }
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
    setTimeout(() => {
      this.next('validation');
    }, 500);
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

  public async requestMobileCode(): Promise<void> {
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
      this.next('validation');
    } catch (error) {
      AppNotification.notify(error.message, 'info');
    }
  }

  public codeChanged() {
    if (this.validateCode.length === 6) {
      this.validateCode(true);
    }
  }

  public async validateCode(silent = false): Promise<void> {
    try {
      if (this.validationCode.length !== 6) {
        throw new Error('Validation code must have 6 digits');
      }
      await validateCode(this.token.token, this.validationCode);
      await this.getIdentity();
      this.next('identity');
    } catch (error) {
      if (!silent) {
        AppNotification.notify(error.message, 'info');
      }
    }
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

  public async setIdentity(): Promise<void> {
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
        } else {
          editUserData.picture = [
            {fileId: `static:${this.avatar.avatar}.gif`, width: 40, height: 40},
            {fileId: `static:${this.avatar.avatar}.gif`, width: 100, height: 100},
            {fileId: `static:${this.avatar.avatar}.gif`, width: 1000, height: 1000},
          ];
        }
      }
      await editMe(editUserData.firstname, editUserData.lastname, editUserData.picture);
      this.router.load('topics');
    } catch (error) {
      AppNotification.notify(error.message, 'info');
    }
  }
}