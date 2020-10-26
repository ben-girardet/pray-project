import { gql } from 'apollo-boost';
import { client } from '../apollo';

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

export async function getTopics() {
  const result = await client.query({query: getTopicsQuery});
  console.log('result', result);
}