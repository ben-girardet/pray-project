import { ApolloQueryResult, gql } from 'apollo-boost';
import { apolloAuth, client } from '../apollo';
import { User } from 'shared/types/user';

const editMeMutation = gql`
mutation EditMe($firstname: String, $lastname: String, $picture: [ImageInput!]) {
  editMe(data: {firstname: $firstname, lastname: $lastname, picture: $picture})
  {
    id,
    firstname,
    lastname,
    picture {
      fileId,
      width,
      height
    },
    state
  }
}`;

export async function editMe(firstname: string | undefined, lastname: string | undefined, picture: {fileId: string, width: number, height: number}[] | undefined): Promise<User> {
  const result = await client.mutate({mutation: editMeMutation, variables: {firstname, lastname, picture}, fetchPolicy: 'no-cache'}) as ApolloQueryResult<{editMe: User}>;
  if (typeof result.data.editMe.state === 'number') {
    apolloAuth.setState(result.data.editMe.state);
  }
  return result.data.editMe;
}
