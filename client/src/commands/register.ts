import { ApolloQueryResult, gql } from 'apollo-boost';
import { client, apolloAuth } from '../apollo';
import { Token } from 'shared/types/token';
import { Login } from 'shared/types/login';

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
mutation ValidateRegistration($token: String!, $code: String!, $type: String!, $password: String!) {
  validateRegistration(data: {token: $token, code: $code, type: $type, password: $password})
  {
    id
  }
}`;

const requestMobileCodeMutation = gql`
mutation RequestMobileCode($mobile: String) {
  requestMobileCode(data: {mobile: $mobile})
  {
    id,
    token
  }
}`;

const validateCodeMutation = gql`
mutation ValidateCode($token: String!, $code: String!) {
  validateCode(data: {token: $token, code: $code})
  {
    token,
    userId,
    expires,
    privateKey,
    state,
    refreshToken,
    refreshTokenExpiry,
  }
}`;

export async function register(mobile: string, email: string, password: string): Promise<Token> {
  const result = await client.mutate({mutation: registerMutation, variables: {mobile, email, password}, fetchPolicy: 'no-cache'}) as ApolloQueryResult<{register: Token}>;
  return result.data.register;
}

export async function validateRegistration(token: string, code: string, type: 'email' | 'mobile', password: string): Promise<{id: string}> {
  const result = await client.mutate({mutation: validateRegistrationMutation, variables: {token, code, type, password}, fetchPolicy: 'no-cache'}) as ApolloQueryResult<{validateRegistration: {id: string}}>;
  return result.data.validateRegistration;
}

export async function requestMobileCode(mobile: string): Promise<Token> {
  const result = await client.mutate({mutation: requestMobileCodeMutation, variables: {mobile}, fetchPolicy: 'no-cache'}) as ApolloQueryResult<{requestMobileCode: Token}>;
  return result.data.requestMobileCode;
}

export async function validateCode(token: string, code: string) {
  const result = await client.mutate({mutation: validateCodeMutation, variables: {token, code}, fetchPolicy: 'no-cache'}) as ApolloQueryResult<{validateCode: Login}>;
  if (result.data.validateCode.expires instanceof Date) {
    result.data.validateCode.expires = result.data.validateCode.expires.toString();
  }
  if (typeof result.data.validateCode.expires === 'string') {
    apolloAuth.setLogin({
      token: result.data.validateCode.token,
      userId: result.data.validateCode.userId, 
      expires: result.data.validateCode.expires,
      privateKey: result.data.validateCode.privateKey,
      state: result.data.validateCode.state
    });
  }
  if (typeof result.data.validateCode.refreshToken === 'string') {
    apolloAuth.setRefreshToken(result.data.validateCode.refreshToken, result.data.validateCode.refreshTokenExpiry);
  }
  return result.data.validateCode;
}
