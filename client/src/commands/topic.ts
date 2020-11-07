import { gql, ApolloQueryResult } from 'apollo-boost';
import { client } from '../apollo';
import { Topic } from 'shared/types/topic';

const getTopicsQuery = gql`
query Topics {
  topics {
    id,
    name,
    description,
    image {
      fileId,
      width,
      height
    },
    color,
    myShare {
      userId,
      encryptedContentKey,
      encryptedBy
    }
  }
}`;

const getTopicQuery = gql`
query Topic($topicId: String!) {
  topic(id: $topicId) {
    id,
    name,
    description,
    image {
      fileId,
      width,
      height
    },
    color,
    shares {
      userId,
      encryptedContentKey,
      encryptedBy
    },
    myShare {
      userId,
      encryptedContentKey,
      encryptedBy
    }
  }
}`;

const createTopicMutation = gql`
mutation CreateTopic($name: String!, $description: String!, $color: String!, $image: [ImageInput!], $encryptedContentKey: String!) {
  createTopic(data: {name: $name, description: $description, color: $color, image: $image, encryptedContentKey: $encryptedContentKey})
  {
    id,
    name,
    description,
    image {
      fileId,
      width,
      height
    },
    color,
    myShare {
      userId,
      encryptedContentKey,
      encryptedBy
    }
  }
}`;

// TODO: add the sort and status variables
export async function getTopics(sort: string, status: string): Promise<Topic[]> {
  const result = await client.query<{topics: Topic[]}>({query: getTopicsQuery});
  return result.data.topics;
}

export async function getTopic(topicId: string): Promise<Topic> {
  const result = await client.query<{topic: Topic}>({query: getTopicQuery, variables: {topicId}});
  return result.data.topic;
}

export async function createTopic(name: string, description: string, color: string, image: {fileId: string, width: number, height: number}[], encryptedContentKey: string): Promise<Topic> {
  const result = await client.mutate<{createTopic: Topic}>({mutation: createTopicMutation, variables: {
    name,
    description,
    color,
    image,
    encryptedContentKey
  }});
  return result.data.createTopic;
}