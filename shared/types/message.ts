import mongoose from 'mongoose';
import { User } from '../../server/src/models/user';

export interface Message {
  id: string;
  text: string;
  createdAt: Date;
  createdBy?: mongoose.Types.ObjectId | User;
  updatedAt: Date;
  updatedBy?: mongoose.Types.ObjectId | User;
}