import { ErrorResponse } from 'apollo-link-error';
import { AppNotification } from './components/app-notification';
import ApolloClient, { Operation } from 'apollo-boost';
import gql from 'graphql-tag';
import { refreshToken } from './commands/login';
import moment from 'moment';
import conf from './config';
import Gun from 'gun';
import 'gun/sea';

const w: any = window;
w.getRefreshToken = function() {
  return window.localStorage.getItem('refreshToken');
}
w.getRefreshTokenExpiry = function() {
  return window.localStorage.getItem('refreshTokenExpiry');
}
w.setRefreshToken = function(refreshToken, refreshTokenExpiry) {
  window.localStorage.setItem('refreshToken', refreshToken);
  window.localStorage.setItem('refreshTokenExpiry', refreshTokenExpiry);
}
class ApolloAuth {

    private expires: moment.Moment;
    private userId: string;
    public authenticated: boolean = false;
    private jwt: string;
    private privateKey: string;
    private state: number;

    private refreshToken?: string;
    private refreshTokenExpiry?: moment.Moment;
    
    public setLogin(login: {token: string, userId: string, expires: string, privateKey: string, state: number}) {
      if (typeof login.expires === 'string') {
        const expDate = moment(login.expires);
        this.expires = expDate;
        this.authenticated = true;
        this.jwt = login.token;
        this.privateKey = login.privateKey;
        this.state = login.state;
      } else {
        this.expires = undefined;
        this.userId = undefined;
        this.authenticated = false;
        this.jwt = '';
        this.privateKey = '';
        this.state = -1;
        throw new Error('Invalid login');
      }
      this.userId = login.userId;
    }

    public setRefreshToken(refreshToken: string, refreshTokenExpiry: string) {
      if (w.setRefreshToken) {
        w.setRefreshToken.call(null, refreshToken, refreshTokenExpiry);
      } else {
        this.refreshToken = refreshToken;
        this.refreshTokenExpiry = moment(refreshTokenExpiry);
      }
    }

    public setState(state: number) {
      this.state = state;
    }

    public getState(): number {
      return this.state;
    }

    public isTokenValid() {
      if (this.expires === undefined) {
        return false;
      }
      if (moment.isMoment(this.expires)) {
        return this.expires.isAfter(moment());
      } else {
        return false;
      }
    }

    public getUserId(): string {
      return this.userId;
    }

    public getToken(): string {
      return this.jwt;
    }

    public getJWT(): string {
      return this.jwt;
    }

    public getRefreshToken(): string | null {
      const refreshToken = w.getRefreshToken ? w.getRefreshToken() : this.refreshToken;
      const refreshTokenExpiry = w.getRefreshTokenExpiry ? moment(w.getRefreshTokenExpiry()) : this.refreshTokenExpiry;
      if (refreshToken && refreshTokenExpiry && refreshTokenExpiry.isValid() && refreshTokenExpiry.isAfter(moment())) {
        return refreshToken;
      }
      if (w.setRefreshToken) {
        w.setRefreshToken.call(null, '', '');
      } 
      delete this.refreshToken;
      delete this.refreshTokenExpiry;
      return null;
    }

    public logout() {
      this.userId = undefined;
      this.expires = undefined;
      this.authenticated = false;
      this.privateKey = '';
    }

    public async refresh(): Promise<boolean> {
      try {
        // when the refreshToken command is successfull
        // it calls the apolloAuth setLogin method
        const result = await refreshToken(!this.privateKey);
        if (!this.isTokenValid() || !this.authenticated) {
          return false;
        }
        return true;
      } catch (error) {
        // silent refresh failing
        return false;
      }
    }

    public async isAuthenticated(): Promise<boolean> {
      if (this.authenticated && this.isTokenValid()) {
        return true;
      }
      return await this.refresh();
    }

    public async encrypt(message: string, otherPublicKey: string): Promise<any> {
      const SEA = Gun.SEA;
      const pair = {epub: otherPublicKey, epriv: this.privateKey, pub: '', priv: ''};
      const data = await SEA.encrypt(
        message, 
        (SEA as any).secret(otherPublicKey, pair));
      return data;
    }

    public async decrypt(encryptedMessage: any, otherPublicKey: string): Promise<string> {
      const SEA = Gun.SEA;
      const pair = {epub: otherPublicKey, epriv: this.privateKey, pub: '', priv: ''};
      const message = await SEA.decrypt(
        encryptedMessage, (SEA as any).secret(otherPublicKey, pair));
      if (typeof message === 'string') {
          return message;
      }
      throw new Error('Not permitted to decrypt this message');
    }
}

export const apolloAuth = new ApolloAuth();

// Standard client
// Perfect if you're not working with authentication
const client = new ApolloClient({
  uri: `${conf.apiHost}/graphql`,
  credentials: 'include',
  request: async (operation: Operation) => {
    if (w.device?.platform) {
      operation.setContext(context => ({
        headers: {
            ...context.headers,
            "sunago-source": `${w.device.platform}-mobile-app`
        }
      }));
    }
    if (operation.operationName !== 'Login' && operation.operationName !== 'RefreshToken' && !apolloAuth.isTokenValid() && apolloAuth.getUserId()) {
        await refreshToken();
    }
    if (operation.operationName === 'RefreshToken' && apolloAuth.getRefreshToken()) {
      operation.setContext(context => ({
        headers: {
            ...context.headers,
            "sunago-refresh-token": apolloAuth.getRefreshToken()
        }
      }));
    }
    const token = apolloAuth.getToken();
    if (token && operation.operationName !== 'RefreshToken' && operation.operationName !== 'Login') {
      operation.setContext(context => ({
        headers: {
            ...context.headers,
            authorization: `Bearer ${token}`
        }
      }));
    }
  },
  onError: (error: ErrorResponse) => {
    const hiddenMessages = [
      'Invalid refresh token',
      'No refresh token',
      'Failed to fetch'
    ];
    const messages = (error.graphQLErrors || [])
    .map(e => e.message)
    .filter(m => !hiddenMessages.includes(m));
    if (error.networkError?.message) {
      messages.push(error.networkError?.message)
    }
    if (messages.length) {
      AppNotification.notify(`${messages.join('; ')}`, 'error');
    }
  }
});

(window as any).__APOLLO_CLIENT__ = client;

// Convenient helper method for queries and mutations
const query = (query) => client.query({ query: gql(query) });
const mutate = (query) => client.mutate({ mutation: gql(query) });
const watch = (query) => client.watchQuery({ query: gql(query)})

export { client, query, mutate, watch };
