import { gql, ApolloQueryResult, FetchPolicy } from 'apollo-boost';
import { client } from '../apollo';
import { Message } from 'shared/types/message';

const createMessageInTopicMutation = gql`
mutation CreateMessageInTopic($topicId: String!, $text: String!, $topicExcerpt: String, $messageExcerpt: String) {
  createMessageInTopic(data: {topicId: $topicId, text: $text}, topicExcerpt: $topicExcerpt, messageExcerpt: $messageExcerpt)
  {
    id,
    text,
    topicId,
    createdBy {
      id,
      firstname,
      lastname,
      picture {
        fileId,
        width,
        height
      }
    },
    createdAt
  }
}`;

const getMessageTextQuery = gql`
query Message($id: String!) {
  message(id: $id) {
    topicId,
    text
  }
}
`

export async function createMessageInTopic(topicId: string, text: string, topicExcerpt: string, messageExcerpt: string): Promise<Message> {
  const result = await client.mutate<{createMessageInTopic: Message}>({
    mutation: createMessageInTopicMutation, 
    variables: {topicId, text, topicExcerpt, messageExcerpt}, fetchPolicy: 'no-cache'});
  return result.data.createMessageInTopic;
}

export async function getMessageText(
  id: string, 
  fetchPolicy: FetchPolicy = 'cache-first'): Promise<Partial<Message>> {
  interface Res {
    message: Partial<Message>
  }
  const result = await client.query<Res>({
    query: getMessageTextQuery, 
    variables: {id}, 
    fetchPolicy});
  return result.data.message;
}
