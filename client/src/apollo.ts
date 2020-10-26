import ApolloClient, { Operation } from 'apollo-boost';
import gql from 'graphql-tag';

// Standard client
// Perfect if you're not working with authentication
const client = new ApolloClient({
  uri: 'http://localhost:3000/graphql',
  credentials: 'include'
});

(window as any).__APOLLO_CLIENT__ = client;

// Client with modification of headers
// Use the following if you want to send a token
// along with every request to Apollo

/*
const client = new ApolloClient({
    uri: environment.apiUrl,
    request: async (operation: Operation) => {
        // Auth might be a service which provides you a token
        const token = await auth.getToken();
        
        // Set the authorization header with the token value
        operation.setContext(context => ({
            headers: {
                ...context.headers,
                authorization: token
            }
        }));
    }
});
*/

// Convenient helper method for queries and mutations
const query = (query) => client.query({ query: gql(query) });
const mutate = (query) => client.mutate({ mutation: gql(query) });
const watch = (query) => client.watchQuery({ query: gql(query)})

export { client, query, mutate, watch };