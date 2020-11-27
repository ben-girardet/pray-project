import { gql, ApolloQueryResult } from 'apollo-boost';
import { client } from '../apollo';
import { Message } from 'shared/types/message';

const createMessageInTopicMutation = gql`
mutation CreateMessageInTopic($topicId: String!, $text: String!) {
  createMessageInTopic(data: {topicId: $topicId, text: $text})
  {
    id,
    text,
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


export async function createMessageInTopic(topicId: string, text: string): Promise<Message> {
  const result = await client.mutate<{createMessageInTopic: Message}>({mutation: createMessageInTopicMutation, variables: {topicId, text}, fetchPolicy: 'no-cache'});
  return result.data.createMessageInTopic;
}