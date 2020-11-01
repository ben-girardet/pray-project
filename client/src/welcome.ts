import { apolloAuth, watch } from './apollo';
import { login } from './commands/login';
import {getTopics } from './commands/topics';
import moment from 'moment';

interface QueryUserInterface {
  users: [{
      id: string;
      firstname: string;
      lastname: string;
  }]
}

export class Welcome {

  private users = [];
  public loading = false;
  private sub?: ZenObservable.Subscription;
  
  public message = 'Welcome to Aurelia 2!';

  public async load() {

    await login('chantal@girardet.ch', 'admin');
    await getTopics();

    if (this.sub) {
      this.sub.unsubscribe();
    }
    try {
      const observer = await watch(`query {
          users {
              id,
              firstname,
              lastname
          }
      }`);
      const sub = observer.subscribe(({data, loading}) => {
        this.loading = loading;
        this.users = data.users;
      });
    } catch (e) {
        console.error(e)
        throw new Error('Could not load users');
    } 

  }

  public async unload() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
