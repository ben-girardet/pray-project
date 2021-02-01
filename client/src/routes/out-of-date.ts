import { Global } from '../global';
import { IDisposable } from 'aurelia';
import { gql } from 'apollo-boost';
import { client, apolloAuth } from '../apollo';

export class OutOfDate {

  public sub: IDisposable;

  constructor(private global: Global) {

  }

  public attached() {
    this.sub = this.global.eventAggregator.subscribe('page:foreground', () => {
      this.checkVersion();
    });
  }

  public detached() {
    if (this.sub) {
      this.sub.dispose();
      delete this.sub;
    }
  }

  private async checkVersion() {
    console.log('checkVersion query');
    const query = gql`query Version {version {v}}`;
    try { 
      const result = await client.query({query, fetchPolicy: 'no-cache'});
      console.log('result', result);
      if (result.data.version) {
        apolloAuth.isOutOfDate = false;
      }
    } catch (error) {
      // do nothing
    }
  }
}
