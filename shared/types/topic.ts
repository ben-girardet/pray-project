import mongoose from 'mongoose';
import { User } from '../../server/src/models/user';
import { Image } from '../../server/src/models/image';

export interface Topic {
  id: string;
  name: string;
  description?: string;
  image?: Image[];
  color: string;
  status: 'active' | 'answered' | 'archived';
  createdAt: Date;
  createdBy?: mongoose.Types.ObjectId | User;
  updatedAt: Date;
  updatedBy?: mongoose.Types.ObjectId | User;
}