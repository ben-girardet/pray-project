import { ErrorResponse } from 'apollo-link-error';
import { AppNotification } from './components/app-notification';
import ApolloClient, { Operation } from 'apollo-boost';
import gql from 'graphql-tag';
import { refreshToken } from './commands/login';
import moment from 'moment';
import conf from './config';
import Gun from 'gun';
import 'gun/sea';

class ApolloAuth {

    private expires: moment.Moment;
    private userId: string;
    public authenticated: boolean = false;
    private jwt: string;
    private privateKey: string;
    
    public setLogin(login: {token: string, userId: string, expires: string, privateKey: string}) {
      if (typeof login.expires === 'string') {
        const expDate = moment(login.expires);
        this.expires = expDate;
        this.authenticated = true;
        this.jwt = login.token;
        this.privateKey = login.privateKey;
      } else {
        this.expires = undefined;
        this.userId = undefined;
        this.authenticated = false;
        this.jwt = '';
        this.privateKey = '';
        throw new Error('Invalid login');
      }
      this.userId = login.userId;
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
    if (operation.operationName !== 'Login' && operation.operationName !== 'RefreshToken' && !apolloAuth.isTokenValid() && apolloAuth.getUserId()) {
        await refreshToken();
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
    console.log('error', error);
    const hiddenMessages = [
      'Invalid refresh token',
      'No refresh token'
    ];
    const messages = (error.graphQLErrors || []).map(e => e.message).filter(m => !hiddenMessages.includes(m));
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