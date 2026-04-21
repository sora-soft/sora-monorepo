import {HttpService} from '../HttpService.js';

class ServiceRegister {
  static init() {
    HttpService.register();
  }
}

export {ServiceRegister};
