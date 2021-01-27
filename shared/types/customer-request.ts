export interface CustomerRequest {
  id: string;
  name: string;
  email: string;
  mobile: string;
  type: string;
  message: string;
  replied: boolean;
  status: 'opened' | 'in-progress' | 'closed';
  createdAt?: Date;
  createdBy?: string | any; // must be more clearly defined from client / server
  updatedAt?: Date;
  updatedBy?: string | any; // must be more clearly defined from client / server
}
