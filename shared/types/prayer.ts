export interface Prayer {
  topicId: string | any;
  createdAt?: Date;
  createdBy?: string | any; // must be more clearly defined from client / server
}