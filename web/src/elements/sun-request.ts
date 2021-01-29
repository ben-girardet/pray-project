import { inject, HttpClient, json } from 'aurelia';
import conf from '../config';

@inject(HttpClient)
export class SunRequest {

  public name: string;
  public email: string;
  public mobile: string;
  public message: string;
  public type: string = 'request-beta';
  public acceptTerms: boolean = true;
  public formMessageElement: HTMLElement;
  public formMessage: string = '';
  public formMessageClasses: string = '';
  // public formClasses: string = '';
  // private form: HTMLFormElement;

  public constructor(private http: HttpClient) {
    http.configure((config) => {
      config.withBaseUrl(`${conf.apiHost}/graphql`);
      return config;
    });
  }

  public async postCustomerRequest(name: string, email: string, mobile: string, message: string, type: string) {
    const body = json({
      operationName: 'CreateCustomerRequest',
      query: `
mutation CreateCustomerRequest($name: String!, $email: String, $mobile: String, $message: String!, $type: String!) {
  createCustomerRequest(data: {
    name: $name,
    email: $email,
    mobile: $mobile,
    message: $message,
    type: $type,
  })
}`,
      variables: { name, email, mobile, message, type }
    });
    const result = await this.http.post('', body, {headers: {
      "content-type": "application/json"
    }});
    const data = await result.json();
    console.log('data', data);
    if (data && data.errors) {
      throw new Error(`Error: ${data.errors[0].message}`);
    } 
    if (data.data.createCustomerRequest) {
      return true;
    }
    throw new Error('Unknown error'); 
  }

  public async post(event: Event) {
    event.preventDefault();
    if (this.acceptTerms) {
      try {
        await this.postCustomerRequest(this.name, this.email, this.mobile, this.message, this.type);
        this.success('Thanks you for your request. We\'ll get back to you shortly');
        this.name = '';
        this.email = '';
        this.mobile = '';
        this.message = '';
      } catch (error) {
        this.error(error.message);
      }
    } else {
      this.error('Please accept the terms before to submit');
    }
    return false;
  }

  public error(msg: string) {
    this.formMessageClasses = 'h3 text-center';
    this.formMessageClasses = 'h3 text-center tada animated';
    this.formMessageElement.addEventListener('animationend', () => {
      this.formMessageClasses = 'h3 text-center';
    }, {once: true});
    this.formMessage = msg;
    this.formMessageElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    });
  }

  public success(msg: string) {
    this.formMessageClasses = '';
    this.formMessageClasses = 'h3 text-center';
    this.formMessage = msg;
    this.formMessageElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    });
  }

}
