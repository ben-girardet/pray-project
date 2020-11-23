export interface Topic {
  id?: string;
  name: string;
  image?: {fileId: string, width: number, height: number}[];
  color: string;
  status: 'active' | 'answered' | 'archived';
  createdAt?: Date;
  createdBy?: string | any; // must be more clearly defined from client / server;
  updatedAt?: Date;
  updatedBy?: string | any; // must be more clearly defined from client / server;
}