import { ApolloQueryResult, gql } from 'apollo-boost';
import { client } from '../apollo';
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
    }
  }
}`;

export async function editMe(firstname: string | undefined, lastname: string | undefined, picture: {fileId: string, width: number, height: number}[] | undefined): Promise<User> {
  const result = await client.mutate({mutation: editMeMutation, variables: {firstname, lastname, picture}, fetchPolicy: 'no-cache'}) as ApolloQueryResult<{editMe: User}>;
  return result.data.editMe;
}