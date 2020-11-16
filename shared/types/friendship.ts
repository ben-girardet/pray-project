

export interface Friendship {
  id: string;
  user1: string | any; // must be more clearly defined from client / server;
  user2: string | any; // must be more clearly defined from client / server;
  requestedBy: string | any; // must be more clearly defined from client / server;
  status: 'requested' | 'accepted' | 'declined' | 'removed';
  requestedAt: Date;
  respondedAt?: Date;
  removedAt?: Date;
}