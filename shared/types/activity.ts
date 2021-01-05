export interface Activity {
  user: any;
  topic?: any;
  prayer?: any;
  message?: any;
  action: ActivityAction;
  date: Date;
  user2?: any;
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
  | 'message:delete';
