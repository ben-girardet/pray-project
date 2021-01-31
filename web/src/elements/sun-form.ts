import { inject, HttpClient, json, bindable } from 'aurelia';
import conf from '../config';

@inject(HttpClient)
export class SunForm {

  @bindable formName: string = '';
  @bindable requestTypes: string[] = [];
  @bindable visibleFields: string[] = ['name', 'email', 'mobile', 'message', 'type'];
  @bindable messageLabel: string = 'Message';
  @bindable messageHelper: string = '';
  @bindable submitText: string = 'Send';

  public name: string;
  public email: string;
  public mobile: string;
  public message: string;
  public type: string = 'request-beta';
  public acceptTerms: boolean = true;

  public dialog: HTMLElement;
  public dialogMessage: string = '';
  public dialogButtonText: string = 'Close';

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
        this.success(`Thanks you so much for your interest in Sungao. We can't wait for you to discover this app.
        <br><br>We'll get back to you very soon with details on how to get access to the beta. And please remember: we love your feedbacks. Good and bad. They all help us to make Sunago better.
        <br><br>Till soon.`);
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
    this.dialogMessage = msg;
    this.dialogButtonText = 'OK';
    this.toggleDialog();
  }

  public toggleDialog() {
    if (this.dialog.hasAttribute('hidden')) {
      this.dialog.removeAttribute('hidden');
    } else {
      this.dialog.setAttribute('hidden', 'hidden');
    }
  }

  public success(msg: string) {
    this.dialogMessage = msg;
    this.dialogButtonText = 'Close';
    this.toggleDialog();
  }
}
