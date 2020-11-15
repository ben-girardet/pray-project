import { ApolloQueryResult, gql } from 'apollo-boost';
import { client, apolloAuth } from '../apollo';
import { Login } from 'shared/types/login';

const loginMutation = gql`
mutation Login($username: String!, $password: String!) {
  login(username: $username, password: $password)
  {
    token,
    userId,
    expires
  }
}`;

const refreshTokenMutation = gql`
mutation RefreshToken {
  refreshToken {
    token,
    userId,
    expires
  }
}`;

const logoutMutation = gql`
mutation Logout {
  logout
}`;

export async function login(username: string, password: string) {
  const result = await client.mutate({mutation: loginMutation, variables: {username, password}, fetchPolicy: 'no-cache'}) as ApolloQueryResult<{login: Login}>;
  if (result.data.login.expires instanceof Date) {
    result.data.login.expires = result.data.login.expires.toString();
  }
  if (typeof result.data.login.expires === 'string') {
    apolloAuth.setLogin({
      token: result.data.login.token,
      userId: result.data.login.userId, 
      expires: result.data.login.expires
    });
  }
  return result.data.login;
}

export async function refreshToken() {
  const result = await client.mutate({mutation: refreshTokenMutation, fetchPolicy: 'no-cache'}) as ApolloQueryResult<{refreshToken: Login}>;
  if (result.data.refreshToken.expires instanceof Date) {
    result.data.refreshToken.expires = result.data.refreshToken.expires.toString();
  }
  if (typeof result.data.refreshToken.expires === 'string') {
    apolloAuth.setLogin({
      token: result.data.refreshToken.token,
      userId: result.data.refreshToken.userId, 
      expires: result.data.refreshToken.expires,
    });
  }
  return result.data.refreshToken;
}

export async function logout(): Promise<boolean> {
  const result = await client.mutate({mutation: logoutMutation, fetchPolicy: 'no-cache'}) as ApolloQueryResult<{logout: boolean}>;
  return result.data.logout;
}