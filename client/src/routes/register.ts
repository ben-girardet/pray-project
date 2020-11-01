import { AvatarSelection } from './../elements/avatar-selection';
import { AuthService, StateService, GunService, GunUser } from './../services/internals';
import { IRouteableComponent } from '@aurelia/router';
import { IViewModel, IRouter, ILogger } from 'aurelia';
import { AppNotification } from '../components/app-notification';
import PhoneNumber from 'awesome-phonenumber';

export class Register implements IRouteableComponent, IViewModel {

  public firstname = 'Ben';
  public lastname = 'Girardet';
  public username = 'ben@platform5.ch';
  public password = '0123';
  public countryCode = 'CH';

  private logger: ILogger;

  public step: 'username' | 'validate' | 'identity' = 'username';
  private type: 'email' | 'mobile';
  private token: string;
  private tokenId: string;
  private code = '001122';
  private userId: string;

  private avatar: AvatarSelection;

  public constructor(
    @IRouter private router: IRouter, 
    @ILogger iLogger: ILogger, 
    private stateService: StateService, 
    private authService: AuthService, 
    private gunService: GunService,
    private gunUser: GunUser) {
    this.logger = iLogger.scopeTo('register route');
  }

  public async beforeBind(): Promise<void> {
    if (this.stateService.authenticated) {
      this.router.goto('topics');
    }
  }

  public goToUsername(): void {
    this.step = 'username';
  }

  public async requestUsername(): Promise<void> {
    if (!this.username || !this.password) {
      AppNotification.notify('Please enter a username (email or mobile) and password', 'info');
      return;
    }
    try {
      const username = this.parseUsername();
      this.type = username.indexOf('@') === -1 ? 'mobile' : 'email';
      const exists = await this.authService.usernameExists(username, this.type);
      if (exists) {
        throw new Error(`Sorry, this ${this.type} is already taken`);
      }
      const validation = await this.authService.requestUsername(this.username, this.type, this.password);
      if (validation.mobileValidation) {
        this.token = validation.mobileValidation.token;
        this.tokenId = validation.mobileValidation._id;
      } else if (validation.emailValidation) {
        this.token = validation.emailValidation.token;
        this.tokenId = validation.emailValidation._id;
      }
      this.step = 'validate';
    } catch (error) {
      AppNotification.notify(error.message, 'info');
    }
  }

  public async resendCode(): Promise<void> {
    try {
      await this.authService.resendCode(this.tokenId, this.token);
    } catch (error) {
      AppNotification.notify(error.message, 'info');
    }
  }

  public async validate(): Promise<void> {
    if (!this.code || this.code.length !== 6) {
      AppNotification.notify(`Please enter the 6 digits code that you've received`, 'info');
      return;
    }
    try {
      const userIdResp = await this.authService.validate(this.tokenId, this.code, this.token);
      this.userId = userIdResp.userId;
      await this.authService.register(this.userId, this.username, this.password);
      this.step = 'identity';
    } catch (error) {
      AppNotification.notify(error.message, 'info');
    }
  }

  public async setIdentity(): Promise<void> {
    try {
      await this.gunUser.set(this.userId, 'firstname', this.firstname);
      await this.gunUser.set(this.userId, 'lastname', this.lastname);
      if (this.avatar) {
        if (this.avatar.avatar === 'image') {
          const imageData = await this.avatar.imageService.publish();
          if (imageData !== 'no-change') {
            await this.gunUser.set(this.userId, 'profilePicSmallB64', imageData.smallB64);
            await this.gunUser.set(this.userId, 'profilePicSmall', imageData.small);
            await this.gunUser.set(this.userId, 'profilePicMedium', imageData.medium);
            await this.gunUser.set(this.userId, 'profilePicLarge', imageData.large);
          }
        } else {
          await this.gunUser.set(this.userId, 'profilePicSmallB64', `static:${this.avatar.avatar}.gif`);
          await this.gunUser.set(this.userId, 'profilePicSmall', `static:${this.avatar.avatar}.gif`);
          await this.gunUser.set(this.userId, 'profilePicMedium', `static:${this.avatar.avatar}.gif`);
          await this.gunUser.set(this.userId, 'profilePicLarge', `static:${this.avatar.avatar}.gif`);
        }
      }
      await this.authService.login(this.username, this.password);
    } catch (error) {
      AppNotification.notify(error.message, 'info');
    }
  }

  public parseUsername(): string {
    const isEmail = this.username.indexOf('@') !== -1;
    if (isEmail) {
      const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if(!re.test(this.username)) {
        throw new Error('Please enter a valid email address or mobile number');
      }
      return this.username;
    } else {
      const phoneNumber = new PhoneNumber( this.username, this.countryCode.toLowerCase() );
      if (!phoneNumber.isValid()) {
        throw new Error('Please enter a valid email address or mobile number');
      }
      return phoneNumber.getNumber();
    }
  }

}