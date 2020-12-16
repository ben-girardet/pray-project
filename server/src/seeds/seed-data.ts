import users from './users';
import topics from './topics';
import messages from './messages';
import prayers from './messages';
import dotenv from 'dotenv';
import { importer } from './importer';

dotenv.config();

new Promise(async (resolve, reject) => {
    try {
        await importer(users, topics, messages, prayers)
    } catch (error) {
        console.error(error);
        reject(error);
    }
    resolve();
}).catch((error) => {
    console.error(error);
}).finally(() => {
    process.exit(0);
});
