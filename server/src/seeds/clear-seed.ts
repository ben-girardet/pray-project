import mongoose from 'mongoose';
import { DocumentType } from '@typegoose/typegoose';
import { config } from '../core/config';

import dotenv from 'dotenv';
import { UserModel } from '../models/user';
import moment from 'moment';

dotenv.config();

mongoose.connect(
    `mongodb://${process.env.MONGOHOST}:${process.env.MONGOPORT}/`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: process.env.DBNAME,
        user: process.env.MONGOUSER,
        pass: process.env.MONGOPASSWORD,
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
