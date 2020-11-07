export interface Login {
  token: string;
  expires: Date | string;
  userId: string;
}