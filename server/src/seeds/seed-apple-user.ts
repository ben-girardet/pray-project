import dotenv from 'dotenv';
import { Encrypt } from './encrypt';
import { UserModel } from '../models/user';
import { ActivityModel } from '../models/activity';
import chalk from 'chalk';
import mongoose from 'mongoose';

dotenv.config();

new Promise(async (resolve, reject) => {
    console.log(chalk.magenta('start'));
    try {
        console.log('MONGO_HOST', process.env.MONGO_HOST);
        console.log('MONGO_PORT', process.env.MONGO_PORT);
        console.log('MONGO_DB', process.env.MONGO_DB);
        await mongoose.connect(
        `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/`,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: process.env.MONGO_DB,
            user: process.env.MONGO_USER,
            pass: process.env.MONGO_PASSWORD,
        });
        console.log(chalk.dim('Connected to database'));
        console.log(chalk.magenta('Fetching Apple User'));
        const appleUser = await UserModel.findOne({mobile: process.env.APPLE_USER});
        if (appleUser) {
            console.log(chalk.blue('Apple user found'));
            return resolve(null);
        }
        console.log(chalk.blue('Apple user not found, let\'s create it'));
        const user = new UserModel();
        user.mobile = process.env.APPLE_USER as string;
        user.mobileValidated = true;
        user.firstname = 'Apple';
        user.lastname = 'Test User';
        user.roles = ['user'];
        const pair = await Encrypt.generatePair();
        user.privateKey = pair.epriv;
        user.publicKey = pair.epub;
        user.state = 1;
        user.hashPassword(process.env.APPLE_PASSWORD as string);
        await user.save();
        console.log(chalk.magenta('Apple user inserted'));
    } catch (error) {
        console.error(error);
        reject(error);
    }
    resolve(null);
}).catch((error) => {
    console.error(error);
}).finally(() => {
    process.exit(0);
});
