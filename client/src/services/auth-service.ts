import { ApiService, GunService, StateService, IUser, GunUser } from './internals';
import { IRouter, inject } from 'aurelia';

// @inject(StateService, GunService, ApiService, IRouter)
export class AuthService {

  constructor(
    private stateService: StateService, 
    private gunService: GunService, 
    private apiService: ApiService, 
    private gunUser: GunUser,
    @IRouter private router: IRouter) {

  }

  /**
   * Request a new user account in the api
   * @param username 
   * @param password 
   */
  public async requestUsername(username: string, type: 'email' | 'mobile', password: string): Promise<{emailValidation?: {_id: string, token: string}, mobileValidation?: {_id: string, token: string}}> {
    const body: any = {
      password
    };
    body[type] = username.toLowerCase();
    return await this.apiService.post('/users/register?testMode=1', body);
  }

  /**
   * Request to resend the code (either to the email or mobile)
   * @param _id 
   * @param token 
   * 
   * @returns string userId
   */
  public async resendCode(_id: string, token:string): Promise<void> {
    await this.apiService.post('/users/resend-code', {_id, token});
    return;
  }

  /**
   * Validate the recently created user account (either email or mobile)
   * @param _id 
   * @param code 
   * @param token 
   * 
   * @returns string userId
   */
  public async validate(_id: string, code: string, token:string): Promise<{userId: string}> {
    return await this.apiService.post('/users/validate', {_id, code, token});
  }

  /**
   * Create the gun user instance, generate pub/priv keys and set the private key in the api user instance
   * @param userId 
   * @param firstname 
   * @param lastname 
   */
  public async register(userId: string, username: string, password: string): Promise<void> {
    let login;
    try {
      username = username.toLowerCase();
      login = await this.apiService.post('/users/login', {username, password});
    } catch (error) {
      throw new Error(`We couldn't log you in with your newly created account`);
    }
    const pair = await this.gunService.genPair();
    const user: IUser = {
      id: userId,
      firstname: '',
      lastname: '',
      profilePicSmallB64: '',
      profilePicSmall: '',
      profilePicMedium: '',
      profilePicLarge: '',
      pubKey: pair.epub,
    };
    await this.gunUser.createUser(user);
    await this.apiService.put('/users/setpk', {pk: pair.epriv}, {headers: {Authorization: `Token ${login.user.token}`}});
    return;
  }

  public async requestResetPassword(): Promise<any> {
    return;
  }

  public async resetPassword(): Promise<any> {
    return;
  }

  public async changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
    return false;
  }

  public async usernameExists(username: string, type: 'mobile' | 'email'): Promise<boolean> {
    const exists = await this.apiService.get(`/users/exists/${type}/${username}`);
    return exists.exists;
  }

  public async login(username: string, password: string): Promise<boolean> {
    username = username.toLowerCase();
    const user = await this.apiService.post('/users/login', {username, password});
    if (user) {
      this.stateService.authenticated = true;
      this.stateService.userId = user.user._id;
      this.stateService.token = user.user.token;
      this.apiService.token = user.user.token;
      const pkResponse = await this.apiService.get('/users/currentpk');
      const secretKey = pkResponse.privateKey;
      const publicKey = await this.gunService.gun.get('users').get(user.user._id).once().get('pubKey').then();
      this.stateService.pair = {
        pub: publicKey,
        epub: publicKey,
        priv: secretKey,
        epriv: secretKey
      };
      this.router.goto('topics');
    } else {
      this.stateService.authenticated = false;
      this.stateService.userId = null;
      this.stateService.token = null;
      this.stateService.pair = null;
    }
    this.stateService.save();
    return this.stateService.authenticated;
  }

  public async logout(): Promise<void> {
    this.stateService.authenticated = false;
    this.stateService.userId = null;
    this.stateService.token = null;
    this.stateService.pair = null;
    this.stateService.save();
    this.router.goto('login');
    this.router.goto('-@bottom');
    this.router.goto('-@praying');
  }

  public async getSecretKey(): Promise<boolean> {
    if (this.stateService.authenticated && this.stateService.token && !this.stateService.pair) {  
      this.apiService.token = this.stateService.token;
      const pkResponse = await this.apiService.get('/users/currentpk');
      const secretKey = pkResponse.privateKey;
      const publicKey = await this.gunService.gun.get('users').get(this.stateService.userId).once().get('pubKey').then();
      this.stateService.pair = {
        pub: publicKey,
        epub: publicKey,
        priv: secretKey,
        epriv: secretKey
      };
      return true;
    } else if (this.stateService.pair) {
      return true;
    } else {
      return false;
    }
  }
}