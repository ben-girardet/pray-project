import { AppNotification } from './../components/app-notification';
import { apolloAuth, client } from './../apollo';
import { gql } from 'apollo-boost';
import { IRouteableComponent, IRouter } from '@aurelia/router';
import { IViewModel } from 'aurelia';
import { User as IUser } from 'shared/types/user';
import { logout } from '../commands/login';

export class Account implements IRouteableComponent, IViewModel {

  // TODO: fix user interface here
  public user: IUser;

  public constructor(@IRouter private router: IRouter) {
    
  }

  public async binding(): Promise<void> {
    this.user = await this.getUser();
  }

  public async getUser(): Promise<{id: string, firstname: string, lastname: string, email: string, mobile: string, picture:{fileId: string, width: number, height: number}[]}> {
    if (!apolloAuth.getUserId()) {
      return null
    }
    const result = await client.query<{user: {
      id: string,
      firstname: string, 
      lastname: string, 
      email: string,
      mobile: string,
      picture: {fileId: string, width: number, height: number}[]}}>({query: gql`query User($userId: String!) {
user(id: $userId) {
  id,
  firstname,
  lastname,
  email,
  mobile,
  picture {
    fileId,
    width,
    height
  }
}
    }`, variables: {userId: apolloAuth.getUserId()}});
    return result.data.user;
  }

  public async logout(): Promise<void> {
    try {
      await logout();
      apolloAuth.logout();
      this.router.load('login');
    } catch (error) {
      AppNotification.notify(error.message, 'error');
    }
  }
}