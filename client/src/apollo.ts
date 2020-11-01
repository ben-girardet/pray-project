import ApolloClient, { Operation } from 'apollo-boost';
import gql from 'graphql-tag';
import { refreshToken } from './commands/login';
import moment from 'moment';

class ApolloAuth {
    expires: Date;
    userId: string;

    public isTokenValid() {
        return moment(this.expires).isAfter(moment());
    }
}

export const apolloAuth = new ApolloAuth();

// Standard client
// Perfect if you're not working with authentication
const client = new ApolloClient({
  uri: 'http://localhost:3000/graphql',
  credentials: 'include',
  request: async (operation: Operation) => {
    if (operation.operationName !== 'Login' && operation.operationName !== 'RefreshToken' && !apolloAuth.isTokenValid() && apolloAuth.userId) {
        await refreshToken(apolloAuth.userId);
    }
  }
});

(window as any).__APOLLO_CLIENT__ = client;

// Convenient helper method for queries and mutations
const query = (query) => client.query({ query: gql(query) });
const mutate = (query) => client.mutate({ mutation: gql(query) });
const watch = (query) => client.watchQuery({ query: gql(query)})

export { client, query, mutate, watch };