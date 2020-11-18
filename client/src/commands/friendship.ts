import { gql, ApolloQueryResult } from 'apollo-boost';
import { client } from '../apollo';
import { Topic } from 'shared/types/topic';

const requestFriendshipMutation = gql`
mutation RequestFriendship($friendId: String!) {
  requestFriendship(friendId: $friendId)
  {
    id,
    friend {
      firstname,
      lastname,
      picture {
        fileId,
        width,
        height
      }
    },
    status
  }
}`;

const removeFriendshipMutation = gql`
mutation RemoveFriendship($friendshipId: String!) {
  removeFriendship(friendshipId: $friendshipId)
}`;

const respondToFriendshipRequestMutation = gql`
mutation RespondToFriendshipRequest($friendshipId: String!, $response: String!) {
  respondToFriendshipRequest(friendshipId: $friendshipId, response: $response) {
    id,
    friend {
      firstname,
      lastname,
      picture {
        fileId,
        width,
        height
      }
    },
    status
  }
}`;

interface Friend {
  firstname: string,
  lastname: string,
  picture: {fileId: string, width: number, height: number}
}

export async function requestFriendship(friendId: string): Promise<{id: string, user1: Friend, user2: Friend}> {
  const result = await client.mutate<{requestFriendship: {id: string, user1: Friend, user2: Friend}}>({mutation: requestFriendshipMutation, variables: {friendId}, fetchPolicy: 'no-cache'});
  return result.data.requestFriendship;
}

export async function removeFriendship(friendshipId: string): Promise<boolean> {
  const result = await client.mutate<{removeFriendship: boolean}>({mutation: removeFriendshipMutation, variables: {friendshipId}, fetchPolicy: 'no-cache'});
  return result.data.removeFriendship;
}

export async function respondToFriendshipRequest(friendshipId: string, response: 'accepted' | 'declined'): Promise<boolean> {
  const result = await client.mutate<{respondToFriendshipRequest: boolean}>({mutation: respondToFriendshipRequestMutation, variables: {friendshipId, response}, fetchPolicy: 'no-cache'});
  return result.data.respondToFriendshipRequest;
}