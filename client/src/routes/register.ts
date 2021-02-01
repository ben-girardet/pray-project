import { Token } from 'shared/types/token';
import { apolloAuth, client } from './../apollo';
import { ApolloQueryResult, gql } from 'apollo-boost';
import { AvatarSelection } from './../elements/avatar-selection';
import { IRouteableComponent } from '@aurelia/router';
import { ICustomElementViewModel, IRouter, ILogger } from 'aurelia';
import { AppNotification } from '../components/app-notification';
import PhoneNumber from 'awesome-phonenumber';
import { register, validateRegistration } from '../commands/register';
import { login } from '../commands/login';
import { editMe } from '../commands/user';
// TODO: remove all instances of /server/ in shared or client
import { Image } from '../../../server/src/models/image';
import { Global } from '../global';

export class Register implements IRouteableComponent, ICustomElementViewModel {

  public firstname = '';
  public lastname = '';
  public username = '';
  public password = '';
  public countryCode = 'CH';

  private logger: ILogger;

  public step: 'username' | 'validate' | 'identity' = 'username';
  private type: 'email' | 'mobile';
  private token: Token;
  private code = '';
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

  public async binding(): Promise<void> {
    if (apolloAuth.authenticated) {
      this.router.load('topics');
    }
  }

  public load(parameters: any): void {
    if (parameters[0] === 'identity') {
      this.step = 'identity';
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
      const exists = await client.query({query: gql`query Exists($username: String!) {
        exists(username: $username)
      }`, variables: {username}}) as ApolloQueryResult<{exists: boolean}>;
      if (exists.data.exists) {
        throw new Error(`Sorry, this ${this.type} is already taken`);
      }
      const mobile = this.type === 'mobile' ? username : undefined;
      const email = this.type === 'email' ? username : undefined;
      this.token = await register(mobile, email, this.type);
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
      await login(this.parseUsername(), this.password);
      this.step = 'identity';
    } catch (error) {
      AppNotification.notify(error.message, 'info');
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
      if (!phoneNumber.isValid() && this.username.substr(0, 6) !== '070000') {
        throw new Error('Please enter a valid email address or mobile number');
      }
      return phoneNumber.getNumber();
    }
  }

}
