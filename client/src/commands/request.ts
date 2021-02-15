import { gql, FetchPolicy } from 'apollo-boost';
import { client } from '../apollo';
import { CustomerRequest } from 'shared/types/customer-request';
import moment from 'moment';

export const getRequestsQuery = gql`
query Requests($sort: SortBy, $status: String) {
  requests(sort: $sort, status: $status) {
    id,
    name,
    email,
    mobile,
    type,
    message,
    replied,
    status,
    createdAt,
    updatedAt
  }
}`;

export const getRequestQuery = gql`
query Request($requestId: String!) {
  request(id: $requestId) {
    id,
    name,
    email,
    mobile,
    type,
    message,
    replied,
    status,
    createdAt,
    updatedAt
  }
}`;

const editRequestMutation = gql`
mutation EditRequest($id: String!, $data: EditRequestInput!) {
  editRequest(id: $id, data: $data)
  {
    id,
    name,
    email,
    mobile,
    type,
    message,
    replied,
    status,
    createdAt,
    updatedAt
  }
}`;

const removeRequestMutation = gql`
mutation RemoveRequest($id: String!) {
  removeRequest(id: $id)
}`;

export async function getRequests(
  sort: {field: string, order: -1 | 1}, 
  status?: string,
  fetchPolicy: FetchPolicy = 'cache-first'): Promise< CustomerRequest[]> {
  interface Res {
    requests:  CustomerRequest[]
  }
  const result = await client.query<Res>({
    query: getRequestsQuery, 
    variables: {sort, status}, 
    fetchPolicy});
  return result.data.requests;
}

export async function getRequest(requestId: string, fetchPolicy: FetchPolicy = 'cache-first') {

}

export async function editRequest(id: string, data: {status?: string;}) {

}

export async function removeRequest(id: string): Promise<boolean> {
  const result = await client.mutate<{removeRequest: boolean}>({
    mutation: removeRequestMutation, 
    variables: { id }
  });
  return result.data.removeRequest;
}
