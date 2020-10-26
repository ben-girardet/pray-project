import { gql } from 'apollo-boost';
import { client } from '../apollo';

const loginMutation = gql`
mutation Login($username: String!, $password: String!) {
  login(username: $username, password: $password)
}`;

const refreshTokenMutation = gql`
mutation RefreshToken {
  login(username: $username, password: $password)
}`;

export async function login(username: string, password: string) {
  const result = await client.mutate({mutation: loginMutation, variables: {username, password}});
  // from here we should set a timeout for a refresh mutation
}

export async function refreshToken() {

}