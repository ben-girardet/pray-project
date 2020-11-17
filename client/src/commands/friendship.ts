import { gql, ApolloQueryResult } from 'apollo-boost';
import { client } from '../apollo';
import { Topic } from 'shared/types/topic';

const requestFriendshipMutation = gql`
mutation RequestFriendship($friendId: String!) {
  requestFriendship(friendId: $friendId)
  {
    id,
    user1 {
      firstname,
      lastname,
      picture {
        fileId,
        width,
        height
      }
    },
    user2 {
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