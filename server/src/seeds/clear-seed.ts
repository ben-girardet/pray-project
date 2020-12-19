import mongoose from 'mongoose';
import { DocumentType } from '@typegoose/typegoose';
import { config } from '../core/config';

import dotenv from 'dotenv';
import { UserModel } from '../models/user';
import moment from 'moment';

dotenv.config();

console.log('MONGO_HOST', process.env.MONGO_HOST);
console.log('MONGO_PORT', process.env.MONGO_PORT);
console.log('MONGO_DB', process.env.MONGO_DB);
console.log('MONGO_USER', process.env.MONGO_USER);
console.log('MONGO_PASSWORD', process.env.MONGO_PASSWORD);

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
            const result = await mongoose.connection.dropDatabase();
            console.log('DROP DATABASE result', result);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }).catch((error) => {
        console.error(error);
    }).finally(() => {
        process.exit(0);
    });
