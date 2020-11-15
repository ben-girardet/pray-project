import { gql, ApolloQueryResult } from 'apollo-boost';
import { client } from '../apollo';
import { Topic } from 'shared/types/topic';

export const getTopicsQuery = gql`
query Topics($sort: SortBy, $status: String) {
  topics(sort: $sort, status: $status) {
    id,
    name,
    description,
    image {
      fileId,
      width,
      height
    },
    color,
    status,
    myShare {
      userId,
      encryptedContentKey,
      encryptedBy
    },
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
    updatedAt
  }
}`;

export const getTopicQuery = gql`
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
    status,
    shares {
      userId,
      encryptedContentKey,
      encryptedBy
    },
    myShare {
      userId,
      encryptedContentKey,
      encryptedBy
    },
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
    updatedAt
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
    status,
    myShare {
      userId,
      encryptedContentKey,
      encryptedBy
    },
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
    updatedAt
  }
}`;

const editTopicMutation = gql`
mutation EditTopic($id: String!, $data: EditTopicInput!) {
  editTopic(id: $id, data: $data)
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
    status,
    myShare {
      userId,
      encryptedContentKey,
      encryptedBy
    },
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
    updatedAt
  }
}`;

const removeTopicMutation = gql`
mutation RemoveTopic($id: String!) {
  removeTopic(id: $id)
}`;

export async function getTopics(sort: {field: string, order: -1 | 1}, status?: string): Promise<Topic[]> {
  const result = await client.query<{topics: Topic[]}>({query: getTopicsQuery, variables: {sort, status}, fetchPolicy: 'network-only'});
  return result.data.topics;
}

export async function getTopic(topicId: string): Promise<Topic> {
  const result = await client.query<{topic: Topic}>({query: getTopicQuery, variables: {topicId}, fetchPolicy: 'network-only'});
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

export async function editTopic(id: string,
  data: {
    name?: string,
    description?: string,
    color?: string;
    status?: string;
    image?: {fileId: string, width: number, height: number}[];
  }): Promise<Topic> {
  const result = await client.mutate<{editTopic: Topic}>({mutation: editTopicMutation, variables: {
    id,
    data
  }});
  return result.data.editTopic;
}

export async function removeTopic(id: string): Promise<boolean> {
  const result = await client.mutate<{removeTopic: boolean}>({mutation: removeTopicMutation, variables: { id }});
  return result.data.removeTopic;
}