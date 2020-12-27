import { inject, HttpClient, json } from 'aurelia';
import conf from '../config';

@inject(HttpClient)
export class ApiService {

  public token: string | undefined;
  
  public constructor(private http: HttpClient) {
    http.configure((config) => {
      config.withBaseUrl(conf.apiHost);
      // config.withBaseUrl('http://localhost:3000/api');
      // TODO: interceptors  ?
      // TODO: implement retry ?
      return config;
    });
  }

  public defaultOptions(): {headers: {[key: string]: string}} {
    const options: {headers: {[key: string]: string}} = {
      headers: {
        "Content-Type": "application/json"
      }
    };
    if (this.token) {
      options.headers.Authorization = `Token ${this.token}`;
    }
    return options;
  }

  public async get(entrypoint: string, options?: RequestInit): Promise<any> {
    options = Object.assign({}, this.defaultOptions(), options);
    const response = await this.http.get(entrypoint, options);
    return this.jsonify(response);
  }

  public async post(entrypoint: string, body: any, options?: RequestInit): Promise<any> {
    options = Object.assign({}, this.defaultOptions(), options);
    if (body instanceof FormData) {
      delete options.headers['Content-Type'];
    } else {
      body = json(body);
    }
    const response = await this.http.post(entrypoint, body, options);
    return this.jsonify(response);
  }

  public async put(entrypoint: string, body: any, options?: RequestInit): Promise<any> {
    options = Object.assign({}, this.defaultOptions(), options);
    if (body instanceof FormData) {
      delete options.headers['Content-Type'];
    } else {
      body = json(body);
    }
    const response = await this.http.put(entrypoint, body, options);
    return this.jsonify(response);
  }

  public async jsonify(response: Response): Promise<any> {
    if (response.status === 204) {
      return true;
    }
    const json = await response.json();
    if (response.status > 299 && json.error) {
      throw new Error(json.error);
    }
    return json;
  }
}
