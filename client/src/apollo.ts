import ApolloClient, { Operation } from 'apollo-boost';
import gql from 'graphql-tag';
import { refreshToken } from './commands/login';
import moment from 'moment';
import conf from './config';

class ApolloAuth {

    private expires: moment.Moment;
    private userId: string;
    public authenticated: boolean = false;
    private jwt: string;
    
    public setLogin(login: {token: string, userId: string, expires: string}) {
      if (typeof login.expires === 'string') {
        const expDate = moment(login.expires);
        this.expires = expDate;
        this.authenticated = true;
        this.jwt = login.token;
      } else {
        this.expires = undefined;
        this.userId = undefined;
        this.authenticated = false;
        this.jwt = '';
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
    }

    public async refresh(): Promise<boolean> {
      console.log('refresh');
      try {
        // when the refreshToken command is successfull
        // it calls the apolloAuth setLogin method
        const result = await refreshToken();
        console.log('result from refreshToken', result);
        if (!this.isTokenValid() || !this.authenticated) {
          return false;
        }
        return true;
      } catch (error) {
        // silent refresh failing
        return false;
      }
        
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
    if (token) {
      operation.setContext(context => ({
        headers: {
            ...context.headers,
            authorization: `Bearer ${token}`
        }
      }));
    }
  }
});

(window as any).__APOLLO_CLIENT__ = client;

// Convenient helper method for queries and mutations
const query = (query) => client.query({ query: gql(query) });
const mutate = (query) => client.mutate({ mutation: gql(query) });
const watch = (query) => client.watchQuery({ query: gql(query)})

export { client, query, mutate, watch };