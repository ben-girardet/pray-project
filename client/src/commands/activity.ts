import { gql, FetchPolicy } from 'apollo-boost';
import { client } from '../apollo';
import { Activity } from 'shared/types/activity';
import moment from 'moment';

export const getActivitiesQuery = gql`
query Activities {
  activities {
    id,
    user {
      id,
      firstname,
      lastname,
      picture {
        fileId,
        width,
        height
      }
    },
    topic {
      name,
      image {
        fileId,
        width,
        height
      },
    },
    prayer,
    message {
      text
    },
    action,
    date,
    user2 {
      id,
      firstname,
      lastname,
      picture {
        fileId,
        width,
        height
      }
    }
  }
}`;

export async function getActivities(fetchPolicy: FetchPolicy = 'cache-first'): Promise<Activity[]> {
  interface Res {
    activities: Activity[]
  }
  const result = await client.query<Res>({
    query: getActivitiesQuery, 
    fetchPolicy});
  return result.data.activities;
}
