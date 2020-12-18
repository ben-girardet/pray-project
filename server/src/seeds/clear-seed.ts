import mongoose from 'mongoose';
import { DocumentType } from '@typegoose/typegoose';
import { config } from '../core/config';

import dotenv from 'dotenv';
import { UserModel } from '../models/user';
import moment from 'moment';

dotenv.config();

mongoose.connect(
    `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: process.env.MONGO_DB,
        user: process.env.MONGO_USER,
        pass: process.env.MONGO_PASSWORD,
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
