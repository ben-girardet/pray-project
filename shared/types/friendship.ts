

export interface Friendship {
  id: string;
  user1: string | any; // must be more clearly defined from client / server;
  user2: string | any; // must be more clearly defined from client / server;
  userId1?: string;
  userId2?: string;
  requestedBy: string | any; // must be more clearly defined from client / server;
  status: 'requested' | 'accepted' | 'declined' | 'removed';
  requestedAt: Date;
  respondedAt?: Date;
  removedAt?: Date;
}
