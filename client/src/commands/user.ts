import { ApolloQueryResult, gql } from 'apollo-boost';
import { client } from '../apollo';
import { User } from 'shared/types/user';
import { Image } from '../../../server/src/models/image';

const editMeMutation = gql`
mutation EditMe($firstname: String, $lastname: String, picture: Image[]) {
  editMe(data: {firstname: $firstname, lastname: $lastname, picture: $picture})
  {
    id,
    firstname,
    lastname,
    picture
  }
}`;

export async function editMe(firstname: string | undefined, lastname: string | undefined, picture: Image[] | undefined): Promise<User> {
  const result = await client.mutate({mutation: editMeMutation, variables: {firstname, lastname, picture}, fetchPolicy: 'no-cache'}) as ApolloQueryResult<{editMe: User}>;
  return result.data.editMe;
}