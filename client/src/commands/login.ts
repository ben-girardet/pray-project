import { gql } from 'apollo-boost';
import { client, apolloAuth } from '../apollo';
import moment from 'moment';

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
mutation RefreshToken($userId: String!) {
  refreshToken(userId: $userId) {
    token,
    userId,
    expires
  }
}`;

export async function login(username: string, password: string) {
  const result = await client.mutate({mutation: loginMutation, variables: {username, password}, fetchPolicy: 'no-cache'});
  apolloAuth.setLogin(result.data.login);
}

export async function refreshToken(userId: string) {
  const result = await client.mutate({mutation: refreshTokenMutation, variables: {userId}, fetchPolicy: 'no-cache'});
  apolloAuth.setLogin(result.data.refreshToken);
}