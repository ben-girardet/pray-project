

export interface Message {
  id: string;
  text: string;
  createdAt?: Date;
  createdBy?: string | any; // must be more clearly defined from client / server
  updatedAt?: Date;
  updatedBy?: string | any; // must be more clearly defined from client / server
}