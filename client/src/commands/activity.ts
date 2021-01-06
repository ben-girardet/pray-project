import { gql, FetchPolicy } from 'apollo-boost';
import { client } from '../apollo';
import { Activity } from 'shared/types/activity';
import moment from 'moment';

export const getActivitiesQuery = gql`
query Activities {
  activities {
    id,
    userId,
    topicId,
    prayerId,
    message {
      text
    },
    action,
    date,
    userId2
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
