export interface Activity {
  user: any;
  userId?: string | null;
  topic?: any;
  topicId?: string | null;
  prayer?: any;
  prayerId?: string | null;
  message?: any;
  messageId?: string | null;
  action: ActivityAction;
  date: Date;
  user2?: any;
  userId2?: string | null;
  data?: string;
}

export type ActivityAction = 
    'topic:create'
  | 'topic:edit:name'
  | 'topic:delete'
  | 'topic:setStatus:answered'
  | 'topic:setStatus:archived'
  | 'topic:setStatus:active'
  | 'topic:share:add'
  | 'topic:share:remove'
  | 'prayed'
  | 'message:create'
  | 'message:edit'
  | 'message:delete'
  | 'friendship:new';
