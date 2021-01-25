import { gql, FetchPolicy } from 'apollo-boost';
import { client } from '../apollo';
import { Activity } from 'shared/types/activity';

export const getActivitiesQuery = gql`
query Activities($since: String) {
  activities(since: $since) {
    id,
    userId,
    topicId,
    prayerId,
    messageId,
    action,
    date,
    userId2,
    data
  }
}`;

export async function getActivities(since: string | null = null, fetchPolicy: FetchPolicy = 'cache-first'): Promise<Activity[]> {
  interface Res {
    activities: Activity[]
  }
  const result = await client.query<Res>({
    query: getActivitiesQuery, 
    variables: {
      since
    },
    fetchPolicy});
  return result.data.activities;
}
