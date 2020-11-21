import { gql, ApolloQueryResult } from 'apollo-boost';
import { client } from '../apollo';
import { Topic } from 'shared/types/topic';
import { WithShares } from 'shared/types/share';

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
      encryptedBy,
      role
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

const addShareToTopicMutation = gql`
mutation AddShareToTopic($id: String!, $userId: String!, $encryptedContentKey: String!) {
  addShareToTopic(id: $id, data: {userId: $userId, encryptedContentKey: $encryptedContentKey}) {
    shares {
      userId, 
      encryptedBy, 
      encryptedContentKey,
      role
    }
  }
}`

const removeShareToTopicMutation = gql`
mutation RemoveShareToTopicMutation($id: String!, $userId: String!) {
  removeShareToTopic(id: $id, userId: $userId) {
    shares {
      userId, 
      encryptedBy, 
      encryptedContentKey,
      role
    }
  }
}`

export async function getTopics(sort: {field: string, order: -1 | 1}, status?: string): Promise<(Topic & WithShares)[]> {
  const result = await client.query<{topics: (Topic & WithShares)[]}>({query: getTopicsQuery, variables: {sort, status}, fetchPolicy: 'network-only'});
  return result.data.topics;
}

export async function getTopic(topicId: string): Promise<Topic & WithShares> {
  const result = await client.query<{topic: Topic & WithShares}>({query: getTopicQuery, variables: {topicId}, fetchPolicy: 'network-only'});
  return result.data.topic;
}

export async function createTopic(name: string, description: string, color: string, image: {fileId: string, width: number, height: number}[], encryptedContentKey: string): Promise<Topic & WithShares> {
  const result = await client.mutate<{createTopic: Topic & WithShares}>({mutation: createTopicMutation, variables: {
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

export async function addShareToTopic(id: string, userId: string, encryptedContentKey: string): Promise<{userId: string, encryptedBy: string, encryptedContentKey: string, role: string}[]> {
  const result = await client.mutate<{addShareToTopic: {shares: {userId: string, encryptedBy: string, encryptedContentKey: string, role: string}[]}}>({mutation: addShareToTopicMutation, variables: { id, userId, encryptedContentKey }});
  return result.data.addShareToTopic.shares;
}

export async function removeShareToTopic(id: string, userId: string): Promise<{userId: string, encryptedBy: string, encryptedContentKey: string, role: string}[]> {
  const result = await client.mutate<{removeShareToTopic: {shares: {userId: string, encryptedBy: string, encryptedContentKey: string, role: string}[]}}>({mutation: removeShareToTopicMutation, variables: { id, userId }});
  return result.data.removeShareToTopic.shares;
}