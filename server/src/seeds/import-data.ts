import mongoose from 'mongoose';
import dotenv from 'dotenv';
import chalk from 'chalk';
import moment from 'moment';
import { importer } from './importer';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import fileType from 'file-type';

dotenv.config();

console.log('MONGO_HOST', process.env.MONGO_HOST);
console.log('MONGO_PORT', process.env.MONGO_PORT);
console.log('MONGO_USER', process.env.MONGO_USER);
console.log('MONGO_PASSWORD', process.env.MONGO_PASSWORD);
console.log('DB', 'sdio');

mongoose.connect(
    `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: 'sdio',
        user: process.env.MONGO_USER,
        pass: process.env.MONGO_PASSWORD,
    }).then(async () => {
    try {
        // here we must import data from swissdata.io
        // then we can call the same script than seeding, but using the imported data as seed
        const appId = new mongoose.Types.ObjectId('5bb8fb7d2a96304d0532f5dc');
        const dynCollection = 'dyn_5bb8fb7d2a96304d0532f5dc';
        const topicModelId = new mongoose.Types.ObjectId('5bb8fc0f2a96304d0532f5de');
        const messageModelId = new mongoose.Types.ObjectId('5d970c87d515072bc3ba720e');
        const prayerModelId = new mongoose.Types.ObjectId('5da71d471ec666202df0edeb');
        const importUsers = {
            'Ben Girardet': 'benjamin@girardet.ch',
            'Chantal Girardet': 'chantal@girardet.ch'
        };
        const importMobiles = {
            'Ben Girardet': '+41792567760',
            'Chantal Girardet': '+41797325550'
        }
        const userEmailFromId: {
            [key: string]: string
        } = {};
        const users = await mongoose.connection.db.collection('users').find({
            appId
        }).toArray();
        const importedUsers: {
            email: string;
            mobile: string;
            password: string;
            firstname: string;
            lastname: string;
            roles: string[];
        } [] = [];
        const importedTopics: {
            userEmail: string;
            status: string;
            name: string;
            image: null | string;
            color: string;
            date: Date;
            answeredAt ? : Date;
            archivedAt ? : Date;
        } [] = [];
        const importedMessages: {
            userEmail: string;
            topicName: string;
            text: string;
            date: Date;
        } [] = [];
        const importedPrayers: {
            userEmail: string;
            topicName: string;
            date: Date;
        } [] = [];
        console.log(chalk.dim('Found'), chalk.magenta(users.length), chalk.dim('users'));
        for (const user of users) {
            if (!importUsers[user.firstname + ' ' + user.lastname]) {
                continue;
            }
            userEmailFromId[user._id.toString()] = importUsers[user.firstname + ' ' + user.lastname];
        }
        for (const user of users) {
            if (!importUsers[user.firstname + ' ' + user.lastname]) {
                continue;
            }
            importedUsers.push({
                email: importUsers[user.firstname + ' ' + user.lastname],
                mobile: importMobiles[user.firstname + ' ' + user.lastname],
                password: 'admin',
                firstname: user.firstname,
                lastname: user.lastname,
                roles: ['user', 'admin']
            });
            console.log(chalk.dim('user'), chalk.magenta(user.firstname, user.lastname), chalk.dim(user.email));
            const topics = await mongoose.connection.db.collection(dynCollection).find({
                appId,
                modelId: topicModelId,
                _createdBy: user._id
            }).toArray();
            console.log(chalk.dim('Found'), chalk.green(topics.length), 'topics for this user');
            if (topics.length) {
                console.log(chalk.green('topic 1', JSON.stringify(topics[0], null, 2)));
            }
            for (const topic of topics) {
                if (!importUsers[user.firstname + ' ' + user.lastname]) {
                    console.log(chalk.red.bold('[Topic] User not found', user.firstname + ' ' + user.lastname))
                }
                let image: null | string = null;
                if (topic.image) {
                    image = await fetchImage(topic._id);
                }
                importedTopics.push({
                    userEmail: importUsers[user.firstname + ' ' + user.lastname],
                    status: topic.status,
                    name: topic.topic,
                    image: image,
                    color: topic.color,
                    date: moment(topic._createdAt).toDate(),
                    answeredAt: topic.answeredAt ? moment(topic.answeredAt).toDate() : undefined
                });
                if (topic.description) {
                    importedMessages.push({
                        userEmail: importUsers[user.firstname + ' ' + user.lastname],
                        topicName: topic.topic,
                        text: topic.description,
                        date: moment(topic._createdAt).toDate()
                    });
                }
                const messages = await mongoose.connection.db.collection(dynCollection).find({
                    appId,
                    modelId: messageModelId,
                    topicId: topic._id
                }).toArray();
                console.log(chalk.dim('Found'), chalk.red(messages.length), 'messages for this topic');
                for (const message of messages) {
                    if (!userEmailFromId[message._createdBy]) {
                        console.log(chalk.red.bold('[Message] User not found', message._createdBy))
                    }
                    importedMessages.push({
                        userEmail: userEmailFromId[message._createdBy],
                        topicName: topic.topic,
                        text: message.message,
                        date: moment(message._createdAt).toDate()
                    });
                }
                const prayers = await mongoose.connection.db.collection(dynCollection).find({
                    appId,
                    modelId: prayerModelId,
                    topicId: topic._id
                }).toArray();
                console.log(chalk.dim('Found'), chalk.red(prayers.length), 'prayers for this topic');
                for (const prayer of prayers) {
                    if (!userEmailFromId[prayer._createdBy]) {
                        console.log(chalk.red.bold('[Prayer] User not found', prayer._createdBy))
                    }
                    importedPrayers.push({
                        userEmail: userEmailFromId[prayer._createdBy],
                        topicName: topic.topic,
                        date: moment(prayer._createdAt).toDate()
                    });
                }
            }
        }
        await mongoose.connection.close();
        await importer(importedUsers, importedTopics, importedMessages, importedPrayers)
    } catch (error) {
        console.error(error);
        throw error;
    }
}).catch((error) => {
    console.error(error);
}).finally(() => {
    process.exit(0);
});

async function fetchImage(topicId: mongoose.Types.ObjectId): Promise<string> {
    const url = `https://api.swissdata.io/prod/dynamicdata/topic/${topicId.toString()}?download=image&apiKey=2b355c97e3ed`;
    const response = await fetch(url);
    if (response.status === 500) {
        const json = await response.json();
        console.log('json', json);
    } else {
        const buffer = await response.buffer();
        const type = await fileType.fromBuffer(buffer);
        const ext = type?.ext || 'jpg';
        const filepath = path.join(__dirname, `./images/${topicId}.${ext}`);
        fs.writeFileSync(filepath, buffer, {encoding: 'binary'});
        return filepath;
    }
    return '';
}
