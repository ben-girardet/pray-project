import { SeaPair } from './internals';
export class StateService {

  public authenticated = false;
  public userId: string;
  public token: string;
  public pair: SeaPair | null;

  public static stored = ['authenticated', 'token', 'userId'];

  public constructor() {
    this.rehydrate();
  }

  public save(): void {
    if (window.localStorage) {
      const stateData: {[key: string]: any} = StateService.stored.reduce(
        (pv, cv) => {
          pv[cv] = this[cv];
          return pv;
        }, 
        {});
      const state = JSON.stringify(stateData);
      window.localStorage.setItem('state', state);
    }
  }

  public rehydrate(): void {
    if (window.localStorage) {
      const state = window.localStorage.getItem('state');
      try {
        const stateData = JSON.parse(state);
        for (const prop of StateService.stored) {
          if (stateData[prop] !== undefined) {
            this[prop] = stateData[prop];
          }
        }
      } catch (error) {
        console.warn('Failed to parse state from localStorage');
        this.authenticated = false;
        this.userId = null;
        this.token = null;
        this.pair = null;
      }
    }
  }
}