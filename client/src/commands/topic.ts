import { gql, FetchPolicy } from 'apollo-boost';
import { client } from '../apollo';
import { Topic } from 'shared/types/topic';
import { Prayer } from 'shared/types/prayer';
import { WithShares } from 'shared/types/share';

export const getTopicsQuery = gql`
query Topics($sort: SortBy, $status: String) {
  topics(sort: $sort, status: $status) {
    id,
    name,
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
    shares {
      userId
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
    updatedAt,
    nbMessages,
    nbPrayers
  }
}`;

export const getTopicQuery = gql`
query Topic($topicId: String!) {
  topic(id: $topicId) {
    id,
    name,
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
      encryptedBy,
      role
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
    updatedAt,
    messages {
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
    },
    prayers {
      id,
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
  }
}`;

const createTopicMutation = gql`
mutation CreateTopic($name: String!, $color: String!, $image: [ImageInput!], $encryptedContentKey: String!) {
  createTopic(data: {name: $name, color: $color, image: $image, encryptedContentKey: $encryptedContentKey})
  {
    id,
    name,
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

const prayMutation = gql`
mutation Pray($topicId: String!) {
  pray(topicId: $topicId) {
    id,
    topicId,
    createdBy {
      id
    }
  }
}
`;

export async function getTopics(
  sort: {field: string, order: -1 | 1}, 
  status?: string,
  fetchPolicy: FetchPolicy = 'cache-first'): Promise<(Topic & WithShares)[]> {
  interface Res {
    topics: (Topic & WithShares)[]
  }
  const result = await client.query<Res>({
    query: getTopicsQuery, 
    variables: {sort, status}, 
    fetchPolicy});
  return result.data.topics;
}

export async function getTopic(topicId: string, options?: {withMessages?: boolean}, fetchPolicy: FetchPolicy = 'cache-first'): Promise<Topic & WithShares> {
  // TODO: find a way to make this "withMessages" work
  // preferable with graphql directive
  // but could also be by using another query
  const withMessages = options?.withMessages === true;
  interface Res {
    topic: Topic & WithShares
  }
  const result = await client.query<Res>({
    query: getTopicQuery, 
    variables: {topicId}, 
    fetchPolicy});
  return result.data.topic;
}

export async function createTopic(name: string, color: string, image: {fileId: string, width: number, height: number}[], encryptedContentKey: string): Promise<Topic & WithShares> {
  interface Res {
    createTopic: Topic & WithShares
  }
  const result = await client.mutate<Res>({
    mutation: createTopicMutation, 
    variables: {
      name,
      color,
      image,
      encryptedContentKey
    }
  });
  return result.data.createTopic;
}

export async function editTopic(id: string,
  data: {
    name?: string,
    color?: string;
    status?: string;
    image?: {fileId: string, width: number, height: number}[];
  }): Promise<Topic> {
  interface Res {
    editTopic: Topic
  }
  const result = await client.mutate<Res>({
    mutation: editTopicMutation, 
    variables: {
      id,
      data
    }
  });
  return result.data.editTopic;
}

export async function removeTopic(id: string): Promise<boolean> {
  const result = await client.mutate<{removeTopic: boolean}>({
    mutation: removeTopicMutation, 
    variables: { id }
  });
  return result.data.removeTopic;
}

export async function addShareToTopic(id: string, userId: string, encryptedContentKey: string): Promise<{userId: string, encryptedBy: string, encryptedContentKey: string, role: string}[]> {
  interface Res {
    addShareToTopic: {
      shares: {
        userId: string, 
        encryptedBy: string, 
        encryptedContentKey: string, 
        role: string
      }[]
    }
  }
  const result = await client.mutate<Res>({
    mutation: addShareToTopicMutation, 
    variables: { id, userId, encryptedContentKey }
  });
  return result.data.addShareToTopic.shares;
}

export async function removeShareToTopic(id: string, userId: string): Promise<{userId: string, encryptedBy: string, encryptedContentKey: string, role: string}[]> {
  interface Res {
    removeShareToTopic: {
      shares: {
        userId: string, 
        encryptedBy: string, 
        encryptedContentKey: string, 
        role: string
      }[]
    }
  }
  const result = await client.mutate<Res>({
    mutation: removeShareToTopicMutation,
    variables: { id, userId }
  });
  return result.data.removeShareToTopic.shares;
}

export async function pray(topicId): Promise<Prayer> {
  const result = await client.mutate<{pray: Prayer}>({
    mutation: prayMutation, 
    variables: { topicId }
  });
  return result.data.pray;
}