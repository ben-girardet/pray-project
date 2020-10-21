import mongoose from 'mongoose';
import { User } from '../../server/src/models/user';

export interface Topic {
  id: string;
  name: string;
  description?: string;
  image: string;
  color: string;
  createdAt: Date;
  createdBy?: mongoose.Types.ObjectId | User;
  updatedAt: Date;
  updatedBy?: mongoose.Types.ObjectId | User;
}