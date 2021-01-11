import { ApolloQueryResult, gql } from 'apollo-boost';
import { apolloAuth, client } from '../apollo';
import { User, HelpId } from 'shared/types/user';

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

export async function helpViewed(helpId: HelpId): Promise<boolean> {
  await client.mutate({mutation: gql`
mutation HelpViewed($helpId: String) {
  editMe(data: {viewedHelpId: $helpId}) {
    id,
    helpSeen
  }
}`, variables: {helpId}}) as ApolloQueryResult<{editMe: User}>;
return true;
}
