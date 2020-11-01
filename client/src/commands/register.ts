import { ApolloQueryResult, gql } from 'apollo-boost';
import { client } from '../apollo';
import { Token } from 'shared/types/token';
import { User } from 'shared/types/user';

const registerMutation = gql`
mutation Register($email: String, $mobile: String) {
  register(data: {email: $email, mobile: $mobile})
  {
    id,
    token,
    code
  }
}`;

const validateRegistrationMutation = gql`
mutation ValidateRegistration($token: String!, code: String!, type: String!, password: String!) {
  validateRegistration(data: {token: $token, code: $code, type: $type, password: $password})
  {
    id,
    email,
    mobile,
  }
}`;

export async function register(username: string, password: string): Promise<Token> {
  const result = await client.mutate({mutation: registerMutation, variables: {username, password}, fetchPolicy: 'no-cache'}) as ApolloQueryResult<{register: Token}>;
  return result.data.register;
}

export async function validateRegistration(token: string, code: string, type: 'email' | 'mobile', password: string): Promise<User> {
  const result = await client.mutate({mutation: validateRegistrationMutation, variables: {token, code, type, password}, fetchPolicy: 'no-cache'}) as ApolloQueryResult<{validateRegistration: User}>;
  return result.data.validateRegistration;
}