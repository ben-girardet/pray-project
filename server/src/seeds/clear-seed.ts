import mongoose from 'mongoose';
import { DocumentType } from '@typegoose/typegoose';
import { config } from '../core/config';

import dotenv from 'dotenv';
import { UserModel } from '../models/user';
import moment from 'moment';

dotenv.config();

mongoose.connect(
    'mongodb://localhost:27017/',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: process.env.DBNAME
    }).then(async () => {
        try {
            await mongoose.connection.dropDatabase();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }).catch((error) => {
        console.error(error);
    }).finally(() => {
        process.exit(0);
    });
