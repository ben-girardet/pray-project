import { Token } from 'shared/types/token';
import { apolloAuth, query } from './../apollo';
import { ApolloQueryResult, gql } from 'apollo-boost';
import { AvatarSelection } from './../elements/avatar-selection';
import { IRouteableComponent } from '@aurelia/router';
import { IViewModel, IRouter, ILogger } from 'aurelia';
import { AppNotification } from '../components/app-notification';
import PhoneNumber from 'awesome-phonenumber';
import { register, validateRegistration } from '../commands/register';
import { editMe } from '../commands/user';
// TODO: remove all instances of /server/ in shared or client
import { Image } from '../../../server/src/models/image';

export class Register implements IRouteableComponent, IViewModel {

  public firstname = 'Ben';
  public lastname = 'Girardet';
  public username = 'ben@platform5.ch';
  public password = '0123';
  public countryCode = 'CH';

  private logger: ILogger;

  public step: 'username' | 'validate' | 'identity' = 'username';
  private type: 'email' | 'mobile';
  private token: Token;
  private code = '001122';
  private userId: string;

  private avatar: AvatarSelection;
  private apolloAuth = apolloAuth;

  public constructor(
    @IRouter private router: IRouter, 
    @ILogger iLogger: ILogger, 
    ) {
    this.logger = iLogger.scopeTo('register route');
  }

  public async beforeBind(): Promise<void> {
    if (apolloAuth.authenticated) {
      this.router.goto('topics');
    }
  }

  public goToUsername(): void {
    this.step = 'username';
  }

  public async requestUsername(): Promise<void> {
    if (!this.username) {
      AppNotification.notify('Please enter a username (email or mobile)', 'info');
      return;
    }
    try {
      const username = this.parseUsername();
      this.type = username.indexOf('@') === -1 ? 'mobile' : 'email';
      const exists = await query(gql`query Exists($username: String!) {
        exists(username: $username)
      }`) as ApolloQueryResult<{exists: boolean}>;
      if (exists.data.exists) {
        throw new Error(`Sorry, this ${this.type} is already taken`);
      }
      this.token = await register(this.username, this.type);
      this.step = 'validate';
    } catch (error) {
      AppNotification.notify(error.message, 'info');
    }
  }

  // TODO: active resendCode
  // public async resendCode(): Promise<void> {
  //   try {
  //     await this.authService.resendCode(this.tokenId, this.token);
  //   } catch (error) {
  //     AppNotification.notify(error.message, 'info');
  //   }
  // }

  public async validate(): Promise<void> {
    if (!this.password || !this.code || this.code.length !== 6) {
      AppNotification.notify(`Please enter the 6 digits code that you've received and a password of your choice`, 'info');
      return;
    }
    try {
      const validation = await validateRegistration(this.token.token, this.code, this.type, this.password);
      this.userId = validation.id;
      this.step = 'identity';
    } catch (error) {
      AppNotification.notify(error.message, 'info');
    }
  }

  public async setIdentity(): Promise<void> {
    const editUserData: {firstname?: string, lastname?: string, picture?: Image[]} = {};
    editUserData.firstname = this.firstname;
    editUserData.lastname = this.lastname;
    if (this.avatar) {
      if (this.avatar.avatar === 'image') {
        const imageData = await this.avatar.imageService.publish();
        if (imageData !== 'no-change') {
          editUserData.picture = [
            {fileId: imageData.smallB64, width: 0, height: 0},
            {fileId: imageData.small, width: 0, height: 0},
            {fileId: imageData.medium, width: 0, height: 0},
            {fileId: imageData.large, width: 0, height: 0},
          ]
        }
      } else {
        editUserData.picture = [
          {fileId: `static:${this.avatar.avatar}.gif`, width: 0, height: 0},
          {fileId: `static:${this.avatar.avatar}.gif`, width: 0, height: 0},
          {fileId: `static:${this.avatar.avatar}.gif`, width: 0, height: 0},
          {fileId: `static:${this.avatar.avatar}.gif`, width: 0, height: 0},
        ];
      }
    }
    try {
      await editMe(editUserData.firstname, editUserData.lastname, editUserData.picture);
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