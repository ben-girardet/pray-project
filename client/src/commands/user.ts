import { ApolloQueryResult, gql } from 'apollo-boost';
import { apolloAuth, client } from '../apollo';
import { User, HelpId } from 'shared/types/user';

const editMeMutation = gql`
mutation EditMe($firstname: String, $lastname: String, $picture: [ImageInput!], $regId: String, $pushTags: [String], $pushActive: Boolean) {
  editMe(data: {firstname: $firstname, lastname: $lastname, picture: $picture, regId: $regId, pushTags: $pushTags, pushActive: $pushActive})
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

export async function editMe(
  firstname: string | undefined, 
  lastname: string | undefined, 
  picture: {fileId: string, width: number, height: number}[] | undefined,
  regId?: string | undefined,
  pushTags?: string[] | undefined,
  pushActive?: boolean | undefined): Promise<User> {
  const result = await client.mutate({
    mutation: editMeMutation, 
    variables: {firstname, lastname, picture, regId, pushTags, pushActive}, 
    fetchPolicy: 'no-cache'}) as ApolloQueryResult<{editMe: User}>;
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
