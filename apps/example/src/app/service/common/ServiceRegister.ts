import {AuthService} from '../AuthService.js';
import {HttpGatewayService} from '../HttpGatewayService.js';

class ServiceRegister {
  static init() {
    HttpGatewayService.register();
    AuthService.register();
  }
}

export {ServiceRegister};
