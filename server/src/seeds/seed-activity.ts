import dotenv from 'dotenv';
import { importer } from './importer';
import { UserModel } from '../models/user';
import { TopicModel, Topic } from '../models/topic';
import { MessageModel, Message } from '../models/message';
import { PrayerModel, Prayer } from '../models/prayer';
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
        await ActivityModel.deleteMany({});
        console.log(chalk.magenta('Old activities removed'));
        const topics = await TopicModel.find();
        console.log(chalk.blue('Found', topics.length, 'topics'));
        for (const topic of topics) {
            const t: Topic = topic.toObject();
            const newActivity = new ActivityModel();
            newActivity.user = t.createdBy;
            newActivity.topic = t._id;
            newActivity.action = 'topic:create';
            newActivity.date = t.createdAt;
            await newActivity.save();
        }
        console.log(chalk.magenta('Topics activity imported'));
        const messages = await MessageModel.find();
        console.log(chalk.blue('Found', messages.length, 'messages'));
        for (const message of messages) {
            const m: Message = message.toObject();
            const newActivity = new ActivityModel();
            newActivity.user = m.createdBy;
            newActivity.topic = m.topicId;
            newActivity.message = m._id;
            newActivity.action = 'message:create';
            newActivity.date = m.createdAt;
            await newActivity.save();
        }
        console.log(chalk.magenta('Messages activity imported'));
        const prayers = await PrayerModel.find();
        console.log(chalk.blue('Found', prayers.length, 'prayers'));
        for (const prayer of prayers) {
            const p: Prayer = prayer.toObject();
            const newActivity = new ActivityModel();
            newActivity.user = p.createdBy;
            newActivity.topic = p.topicId;
            newActivity.prayer = p._id;
            newActivity.action = 'prayed';
            newActivity.date = p.createdAt;
            await newActivity.save();
        }
        console.log(chalk.magenta('Prayers activity imported'));
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
